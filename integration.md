# handling prompt for email validation

enter email for the account in the form, which appears to be an embedded 

```html
<div data-v-6fd33cb0=""><div data-v-6fd33cb0="" class="mt-5 mt-md-3 title">
			Log in to Parental Controls
		</div> <div data-v-6fd33cb0="" class="text-center mt-3">
			Enter the parent or guardian email for the Blizzard Account you would like to manage:
		</div> <form data-v-6fd33cb0=""><div data-v-6fd33cb0="" class="row form-body"><div data-v-6fd33cb0="" class="col mt-4"><input data-v-6fd33cb0="" type="text" id="email" name="email" placeholder="Parent or Guardian Email" data-vv-validate-on="blur" data-vv-as="parent or guardian email" class="input-block is-error" aria-required="true" aria-invalid="true"> <span data-v-6fd33cb0="" class="is-error" style="">The parent or guardian email field is required.</span></div></div> <div data-v-6fd33cb0="" class="row"><div data-v-6fd33cb0="" class="col"><button data-v-312dd04b="" data-v-6fd33cb0="" id="274669047" class="btn-primary submit-button btn" disabled="disabled">
						Log In
					</button></div></div></form> <div data-v-6fd33cb0="" class="footer text-center pt-3 pl-1 pr-1 mt-4"><span data-v-6fd33cb0="">To set up parental controls, log in to <a data-v-6fd33cb0="" href="/" place="AccountSettings" target="_blank" rel="external">Account Settings
						<svg data-v-6fd33cb0="" aria-hidden="true" focusable="false" data-prefix="far" data-icon="external-link-alt" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-external-link-alt fa-w-16"><path data-v-6fd33cb0="" fill="currentColor" d="M432,288H416a16,16,0,0,0-16,16V458a6,6,0,0,1-6,6H54a6,6,0,0,1-6-6V118a6,6,0,0,1,6-6H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V304A16,16,0,0,0,432,288ZM500,0H364a12,12,0,0,0-8.48,20.48l48.19,48.21L131.51,340.89a12,12,0,0,0,0,17l22.63,22.63a12,12,0,0,0,17,0l272.2-272.21,48.21,48.2A12,12,0,0,0,512,148V12A12,12,0,0,0,500,0Z" class=""></path></svg></a> with the child account and select Parental Controls.</span></div></div>
```

so use:
```html
<input data-v-6fd33cb0="" type="text" id="email" name="email" placeholder="Parent or Guardian Email" data-vv-validate-on="blur" data-vv-as="parent or guardian email" class="input-block is-error" aria-required="true" aria-invalid="true">
```
and submit with:
```html
<button data-v-312dd04b="" data-v-6fd33cb0="" id="274669047" class="btn-primary submit-button btn">
						Log In
					</button>
```

seems to send a post request:

```
Summary
URL: https://account.blizzard.com/api/parental-controls/code/check
Status: 200
Source: Network
Address: 13.125.56.180:443
Initiator: 
app.ff5ce358aaa702523627.js:1:531540


Request
:method: POST
:scheme: https
:authority: account.blizzard.com
:path: /api/parental-controls/code/check
Content-Type: application/json
Accept: */*
Accept-Encoding: gzip, deflate, br
Accept-Language: en-au
Host: account.blizzard.com
Origin: https://account.blizzard.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15
Connection: keep-alive
Referer: https://account.blizzard.com/parent-portal/access
Content-Length: 71
Cookie: _ga=GA1.2.1709966123.1613784041; _gat_UA-50249600-1=1; _gid=GA1.2.2133899473.1613784041; OptanonConsent=EU=false&groups=1%3A1%2C2%3A1%2C3%3A1%2C4%3A1%2C8%3A1%2C101%3A1; SESSIONID=YjY0Zjdk8759765876597657659765QzMTg0; XSRF-TOKEN=4c3d242b-dc5f-41f8-8ac4-e495d5164fc4
X-XSRF-TOKEN: 4c3d242b-dc5f-41f8-8ac4-e495d5164fc4

Response
:status: 200
X-Content-Type-Options: nosniff
Pragma: no-cache
Content-Type: application/json;charset=UTF-8
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blzaccount.akamaized.net *.battle.net *.account.blizzard.com navbar.blizzard.com https://www.google-analytics.com https://blzmedia-a.akamaihd.net https://tagmanager.google.com https://stats.g.doubleclick.net https://fonts.googleapis.com; img-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://blznav.akamaized.net https://blzaccount.akamaized.net https://images.blz-contentstack.com https://account.cnc.blzstatic.cn https://ssl.gstatic.com https://www.gstatic.com https://www.google.com https://d2ymosfw5yb3t5.cloudfront.net https://bnetus-a.akamaihd.net https://bneteu-a.akamaihd.net https://bnettw-a.akamaihd.net https://bnetkr-a.akamaihd.net https://bnetproduct-a.akamaihd.net https://product.cnc.blzstatic.cn *.account.blizzard.com https://www.google-analytics.com https://blzprofile.akamaized.net *.googleusercontent.com graph.facebook.com *.fbcdn.net *.fbsbx.com mem.gfx.ms *.accounts.nintendo.com https://static-resource.np.community.playstation.net http://static-resource.np.community.playstation.net https://static-resource.sp-int.community.playstation.net http://static-resource.sp-int.community.playstation.net; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blzaccount.akamaized.net account.cnc.blzstatic.cn *.battle.net *.account.blizzard.com www.battlenet.com.cn https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://geolocation.onetrust.com https://jssdkcdns.mparticle.com;
Set-Cookie: parentalControls=YmF0dGxlQHJvby5lbXUuaWQuYXU6OW675976587658765876587658ZTFjNzJlYTBkYmMxOGJlNThlM2RiOTFjMmU3YTA4MGNkY2JmOQ==; Path=/; Max-Age=1800; Expires=Sat, 20 Feb 2021 02:11:36 GMT; Secure; SameSite=Strict
Date: Sat, 20 Feb 2021 01:41:36 GMT
X-Frame-Options: DENY
Vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers
Expires: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Strict-Transport-Security: max-age=31536000 ; includeSubDomains

Request Data
MIME Type: application/json
Request Data: 
{"parentEmail":"email@bob.com","code":"123456","noCookie":false}
```

then calls a get to get the parent account portal page:

```
Summary
URL: https://account.blizzard.com/api/parental-controls/children?parentEmail=email%40bob.com
Status: 404
Source: Network
Address: 13.125.56.180:443
Initiator: 
app.ff5ce358aaa702523627.js:1:531540


Request
:method: GET
:scheme: https
:authority: account.blizzard.com
:path: /api/parental-controls/children?parentEmail=email%40bob.com
Accept: */*
Content-Type: application/json
Cookie: _ga=GA1.2.1709966123.1613784041; _gid=GA1.2.2133899473.1613784041; parentalControls=YmF0dGxlQHJvby5lbXUuaWQuYXU6OW675976587658765876587658ZTFjNzJlYTBkYmMxOGJlNThlM2RiOTFjMmU3YTA4MGNkY2JmOQ==; _gat_UA-50249600-1=1; OptanonConsent=EU=false&groups=1%3A1%2C2%3A1%2C3%3A1%2C4%3A1%2C8%3A1%2C101%3A1; SESSIONID=YjY0ZjdkYjUtNzViMC00NGY5LTlmZDAtMjI5MTk3ZTQzMTg0; XSRF-TOKEN=4c3d242b-dc5f-41f8-8ac4-e495d5164fc4
Accept-Encoding: gzip, deflate, br
Host: account.blizzard.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15
Referer: https://account.blizzard.com/parent-portal/child-selection?parentEmail=email%40bob.com
Accept-Language: en-au
Connection: keep-alive
X-XSRF-TOKEN: 4c3d242b-dc5f-41f8-8ac4-e495d5164fc4

Response
:status: 404
X-Content-Type-Options: nosniff
Pragma: no-cache
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blzaccount.akamaized.net *.battle.net *.account.blizzard.com navbar.blizzard.com https://www.google-analytics.com https://blzmedia-a.akamaihd.net https://tagmanager.google.com https://stats.g.doubleclick.net https://fonts.googleapis.com; img-src 'self' 'unsafe-inline' 'unsafe-eval' data: https://blznav.akamaized.net https://blzaccount.akamaized.net https://images.blz-contentstack.com https://account.cnc.blzstatic.cn https://ssl.gstatic.com https://www.gstatic.com https://www.google.com https://d2ymosfw5yb3t5.cloudfront.net https://bnetus-a.akamaihd.net https://bneteu-a.akamaihd.net https://bnettw-a.akamaihd.net https://bnetkr-a.akamaihd.net https://bnetproduct-a.akamaihd.net https://product.cnc.blzstatic.cn *.account.blizzard.com https://www.google-analytics.com https://blzprofile.akamaized.net *.googleusercontent.com graph.facebook.com *.fbcdn.net *.fbsbx.com mem.gfx.ms *.accounts.nintendo.com https://static-resource.np.community.playstation.net http://static-resource.np.community.playstation.net https://static-resource.sp-int.community.playstation.net http://static-resource.sp-int.community.playstation.net; script-src 'self' 'unsafe-inline' 'unsafe-eval' data: blzaccount.akamaized.net account.cnc.blzstatic.cn *.battle.net *.account.blizzard.com www.battlenet.com.cn https://www.googletagmanager.com https://tagmanager.google.com https://www.google-analytics.com https://geolocation.onetrust.com https://jssdkcdns.mparticle.com;
Vary: Origin, Access-Control-Request-Method, Access-Control-Request-Headers
Date: Sat, 20 Feb 2021 01:41:36 GMT
X-Frame-Options: DENY
Content-Length: 0
Expires: 0
Cache-Control: no-cache, no-store, max-age=0, must-revalidate
Strict-Transport-Security: max-age=31536000 ; includeSubDomains

Query String Parameters
parentEmail: email@bob.com
```

# submitting validation code

```html
<div data-v-064107a4="" data-v-e89fba0e="" class="code-verification blz-code-input-container d-flex justify-content-around" style="max-width: 276px;"><input data-v-064107a4="" type="text" autofocus="true" data-id="0" maxlength="1" class="code-input uppercase" style="max-width: 40px; height: 45px;"><input data-v-064107a4="" type="text" data-id="1" maxlength="1" class="code-input uppercase" style="max-width: 40px; height: 45px;"><input data-v-064107a4="" type="text" data-id="2" maxlength="1" class="code-input uppercase" style="max-width: 40px; height: 45px;"><input data-v-064107a4="" type="text" data-id="3" maxlength="1" class="code-input uppercase" style="max-width: 40px; height: 45px;"><input data-v-064107a4="" type="text" data-id="4" maxlength="1" class="code-input uppercase" style="max-width: 40px; height: 45px;"><input data-v-064107a4="" type="text" data-id="5" maxlength="1" class="code-input uppercase" style="max-width: 40px; height: 45px;"></div>
```

and submit:

```html
<button data-v-312dd04b="" data-v-e89fba0e="" id="274669047" class="btn-verification-code btn-primary btn">
				Verify
		</button>
```
