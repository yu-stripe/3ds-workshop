require 'sinatra'
require 'stripe'
# This is your test secret API key.
Stripe.api_key = ENV['STRIPE_SECRET_KEY']
stripe_webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']

set :static, true
set :port, 4242

before do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
end

options "*" do
  response.headers["Allow"] = "GET, POST, OPTIONS"
  200
end

# Securely calculate the order amount
def calculate_order_amount(_items)
  # Calculate the order total on the server to prevent
  # people from directly manipulating the amount on the client
  _items.sum {|h| h['amount']}
end

# An endpoint to start the payment process
post '/create-setup-intent' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  # Create a PaymentIntent with amount and currency
  payment_intent = Stripe::SetupIntent.create(
    usage: 'on_session',
    customer: data['customer_id'],
    payment_method_types: ['card'],
  )

  {
    clientSecret: payment_intent.client_secret,
    # [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
    dpmCheckerLink: "https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=#{payment_intent.id}",
  }.to_json
end

# An endpoint to start the payment process
post '/create-payment-intent' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  # Create a PaymentIntent with amount and currency
  payment_intent = Stripe::PaymentIntent.create(
    currency: 'jpy',
    # In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
  )

  {
    clientSecret: payment_intent.client_secret,
    # [DEV]: For demo purposes only, you should avoid exposing the PaymentIntent ID in the client-side code.
    dpmCheckerLink: "https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=#{payment_intent.id}",
  }.to_json
end


post '/create-customer' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  # Create a PaymentIntent with amount and currency
  customer = Stripe::Customer.create(
    email: data['email'],
  )

  {
    id: customer.id,
    email: customer.email
  }.to_json

end


# 保存済みのカード情報を取得するエンドポイント
get '/get-saved-cards' do
  content_type 'application/json'
  customer_id = params[:customer_id]

  begin
    payment_methods = Stripe::PaymentMethod.list({
      customer: customer_id,
      type: 'card'
    })

    cards = payment_methods.data.map do |pm|
      {
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        exp_month: pm.card.exp_month,
        exp_year: pm.card.exp_year
      }
    end

    { cards: cards }.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end



post '/create-intent-and-customer-session' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  intent = Stripe::PaymentIntent.create({
    amount: 1099,
    currency: 'jpy',
    # In the latest version of the API, specifying the `automatic_payment_methods` parameter
    # is optional because Stripe enables its functionality by default.
    automatic_payment_methods: { enabled: true },
    customer: data['customer_id'],
  })

  customer_session = Stripe::CustomerSession.create({
    customer: data['customer_id'],
    components: {
      payment_element: {
        enabled: true,
        features: {
          payment_method_redisplay: 'enabled',
          payment_method_allow_redisplay_filters: ['always', 'limited', 'unspecified'],
        },
      },
    },
  })

  content_type :json
  {
    clientSecret: intent.client_secret,
    customerSessionClientSecret: customer_session.client_secret
  }.to_json
end


customer_events = {}

post '/webhook' do
  payload = request.body.read
  sig_header = request.env['HTTP_STRIPE_SIGNATURE']
  event = nil

  begin
    event = Stripe::Webhook.construct_event(
      payload, sig_header, stripe_webhook_secret 
    )
  rescue JSON::ParserError => e
    # Invalid payload
    status 400
    return
  rescue Stripe::SignatureVerificationError => e
    # Invalid signature
    status 400
    return
  end

  # payment_intentとsetup_intentのイベントのみを処理
  if ['payment_intent', 'setup_intent'].include?(event.data.object.object)
    customer_id = event.data.object.customer

    if customer_id
      customer_events[customer_id] ||= []
      customer_events[customer_id].unshift({
        type: event.type,
        created: event.created,
        id: event.data.object.id
      })

      # SetupIntentのIDを追加
      if event.data.object.object == 'setup_intent'
        customer_events[customer_id][:setup_intent_id] = event.data.object.id
      end

      if event.data.object.object == 'payment_intent'
        customer_events[customer_id][:payment_intent_id] = event.data.object.id
      end
      # 各顧客の最新10件のイベントのみを保持
      customer_events[customer_id] = customer_events[customer_id].take(10)
    end
  end

  status 200
end

# Webhookイベントを返すエンドポイント
get '/webhook-events/:customer_id' do
  content_type :json

  customer_id = params['customer_id']
  (customer_events[customer_id] || []).to_json
end
