# Stripe 3Dセキュア Workshop

3Dセキュアの仕様を理解し、StripeのPaymentElementを使って、3Dセキュアを扱う方法を学びます。

## 3つのユーザーストーリー

### ユーザーストーリー1

サインアップして、アカウントに対して、カードを保存します。ここでは商品やサービスの購入は行われず、カードの有効性を確認し、カードの保存を行います。

### ユーザーストーリー2

保存したカードで、商品を購入します。セキュアなログインを前提に、カードの入力を省略し、保存済みのカードで決済を行います。

### ユーザーストーリー3

加盟店起因で、管理画面から、保存されたカードで決済を行います。例えば、定期購入や、サブスクリプションのような決済です。


## ワークショップのタスク

1. **まずはサインアップします。**  
   - コードに慣れるために、サインアップのパスワードがコードに埋め込まれているので、それを探してサインアップしてください。

2. **サンプルコードを確認すると、3Dセキュアのためのハンドルはあったか？**  
   - サンプルコードに3Dセキュア関連のハンドリングが実装されているか確認します。

3. **サンプルコードを確認すると、Areqのフィールドを送るコードはあったか？**  
   - Areqフィールド（Authentication Request）を送信するコードが含まれているか検証します。

4. **サンプルコードを確認すると、購入ごとに3Dセキュアフローの起動条件の指定はあったか？**  
   - 購入ごとの3Dセキュアフローを起動する条件が正しく指定されているか確認します。

5. **サンプルコードにカート情報を追加すると、ユーザーストーリー2において、3Dセキュアの起動は変わったか？**  
   - カート情報を追加した際に、3Dセキュアのフローがどのように変わるか観察します。

6. **カードホルダーが3Dセキュアに登録してない場合どうなったか？**  
   - カードホルダーが3Dセキュアに登録していない場合の挙動を確認します。

7. **リスクが高い決済でかつ、metadataでカート情報を送り、再販性の高い商品である、 `key:value = sku: premium_product_aa` を送信して、3Dセキュアの挙動を確認してください。**  
   - このタスクでは、特定のSKUの関連情報を含めて、3Dセキュアの挙動をテストします。




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


