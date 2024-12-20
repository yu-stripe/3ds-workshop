require 'sinatra'
require 'stripe'
# This is your test secret API key.
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

set :static, true
set :port, 4242

before do
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
  response.headers['Content-Security-Policy'] = "sandbox allow-same-origin"
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

  setup_intent = Stripe::SetupIntent.create(
    customer: data['customer_id'],
    payment_method_types: ['card'],
    usage: 'off_session',
    payment_method_options: {
      card: {
        request_three_d_secure: 'any' #　義務化のシミュレーションのための設定です。義務化以降はStipeが自動的に判定されます。
      }
    }
  )

  {
    clientSecret: setup_intent.client_secret,
  }.to_json
end

# An endpoint to start the payment process
post '/create-payment-intent' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  # Create a PaymentIntent with amount and currency
  payment_intent = Stripe::PaymentIntent.create(
    currency: 'jpy',
  )

  {
    clientSecret: payment_intent.client_secret,
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

    customer = Stripe::Customer.retrieve(customer_id)

    { cards: cards, customer: customer }.to_json
  rescue Stripe::StripeError => e
    status 400
    { error: e.message }.to_json
  end
end



post '/create-intent-off-session' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  intent = Stripe::PaymentIntent.create({
    amount: 1099,
    currency: 'jpy',
    customer: data['customer_id'],
    payment_method: data['payment_method_id'],
    off_session: true,
    confirm: true
  })

  content_type :json
  {
    intent: intent
  }.to_json
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
    metadata: data['metadata'],
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
