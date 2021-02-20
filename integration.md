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
