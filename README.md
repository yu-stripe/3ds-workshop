# Stripe 3Dセキュア Workshop

3Dセキュアの仕様を理解し、StripeのPaymentElementを使って、3Dセキュアを扱う方法を学びます。

## 3つのユーザーストーリー

![signup.html](/image/signup.html.png) 
_signup.html_

### ユーザーストーリー1

![save-card.html](/image/save-card.html.png) 
_save-card.html_

サインアップして、アカウントに対して、カードを保存します。ここでは商品やサービスの購入は行われず、カードの有効性を確認し、カードの保存を行います。

### ユーザーストーリー2

![checout.html](/image/checkout.html.png) 
_checkout.html_

保存したカードで、商品を購入します。セキュアなログインを前提に、カードの入力を省略し、保存済みのカードで決済を行います。

### ユーザーストーリー3

![admin.html](/image/admin.html.png) 
_admin.html_

加盟店起因で、管理画面から、保存されたカードで決済を行います。例えば、定期購入や、サブスクリプションのような決済です。


## ワークショップのタスク

### Stage 1

1. コードをダウンロードして、サインアップページを開く
   - [ ] 全てのタスクは、`public/` 以下の編集で行えます
   - [ ] `public/signup.html` をブラウザで開いてください

2. まずはこのサービスにサインアップします。  
   - [ ] サインアップのパスワードがコードに埋め込まれているので、それを探してサインアップしてください
   - [ ] サインアップすると、`Customer` オブジェクトが生成されます

### Stage 2

1. カード登録ページで、ユーザーストリー1を実行してください。
   - [ ] `save-card.html` にて、カード保存を行って、3Dセキュアの起動を確認してください
   - [ ] `4000002500003155` をテストカードとして使い、有効期限、セキュリティコードは任意で入力してください
   - [ ] サンプルコードに3Dセキュア関連のハンドリングが実装されていますか？
   - [ ] Areqフィールド（Authentication Request）を送信するコードが含まれていますか？

2. 商品購入ページで、ユーザーストーリー2を実行してください。
   - [ ] `public/checkout.html` にて、保存したカードで、購入を行なってください
   - [ ] サンプルコードに3Dセキュア関連のハンドリングが実装されているか確認します。
   - [ ] 義務化によると、3Dセキュアの起動はここでは行われません、仕様通りの実装になっていますか？

3. 管理者ページにて、ユーザーストーリー3を実行してください。
   - [ ] `/public/admin.html` にて、保存したカードで、加盟店起因で、購入を行なってください
   - [ ] 義務化によると、3Dセキュアの起動はここでは行われません、仕様通りの実装になっていますか？
   - [ ] Stripeにおける、`off_session` とはなんでしょうか？Stripeドキュメントを調べてください

### Stage 3

1. サンプルコードにカート情報を追加すると、ユーザーストーリー2において、3Dセキュアの起動は変わったか？
   - [ ] `public/checkout.html` を開き、カード保存時にすでに3Dセキュアを実行しているもので決済をします
   - [ ] `public/checkout.js` を編集します
   - [ ] リスクが高い決済でかつ、metadataでカート情報を送り、再販性の高い商品である、 `key:value` = `product_sku:expensive_sku` を送信して、3Dセキュアの挙動を確認してください。
   - [ ] API `POST /${backend}/create-intent-and-customer-session`  は、以下の形で、リクエストをとります
       - ```
         { customer_id: {{customerID}}, metadata: { {{key}}: {{value}} } }   
         ```

### Stage 4
1. カードホルダーが3Dセキュアに登録してない場合どうなったか？  
   - [ ] カードホルダーが3Dセキュアに登録していない場合の挙動を確認します。
   - [ ] カード発行会社は、3Dセキュアに対応していても、ユーザーが登録していないケースがあります、この場合の挙動はどうなりますか？
   - [ ] ユーザーが3Dセキュアを登録していないカード、　`4242424242424242` で、3つのユーザーストーリーの挙動を確認してください



## 技術スタック

HTML/CSSとJavascriptで書いてあります。フレームワークを使っていないので、冗長的かもしれませんが、前提の知識を最小限に抑えています。

## 基礎知識

### Stripeの用語

**PaymentIntent:**  
PaymentIntentは、Stripeでの支払いを管理するためのオブジェクトです。このオブジェクトは、支払いの状態を遷移させ、実際の支払い操作（購入、リファンドなど）を行うために必要な情報を含んでいます。特に3Dセキュアが必要な場合、PaymentIntentを使用して、ユーザーが承認を行うためのフローを管理します。  

参照: [Payment Intent Documentation](https://stripe.com/docs/api/payment_intents)

**SetupIntent:**  
SetupIntentは、将来の支払いのためにカード情報を保存するためのオブジェクトです。主に定期的な支払い（サブスクリプションなど）や、後で使用する目的でカード情報を取得する際に用いられます。SetupIntentを利用して、3Dセキュアの要求に応じてユーザーの認証を得ることも可能です。  

参照: [Setup Intent Documentation](https://stripe.com/docs/api/setup_intents)

**Metadata:**  
Metadataは、Stripeのオブジェクトに追加情報を付加するためのキーとバリューのペアです。例えば、顧客のIDや注文番号などのカスタムデータをPaymentIntentやCustomerオブジェクトに保存することができます。これにより、データを整理し、業務管理や分析に役立てることができます。  

参照: [Metadata Documentation](https://stripe.com/docs/api/metadata)

**Radar:**  
Radarは、Stripeが提供する詐欺検出ツールです。このツールは、取引が安全であるかどうかを判断し、不正行為を防ぐためのリアルタイムの分析を行います。Radarは、機械学習を用いて、新たな詐欺のパターンを特定し、ビジネスオーナーに対して安全な決済体験を提供します。  

参照: [Radar Documentation](https://stripe.com/docs/radar)

### リンク集

[Stripe Docs](https://stripe.com/docs)
[Stripe API Reference](https://stripe.com/docs/api)
