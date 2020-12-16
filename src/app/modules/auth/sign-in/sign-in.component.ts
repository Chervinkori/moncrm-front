import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {TreoAnimations} from '@treo/animations';
import {AuthService} from 'app/core/auth/auth.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: TreoAnimations
})
export class AuthSignInComponent implements OnInit {
    signInForm: FormGroup;
    message: any;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {AuthService} _authService
     * @param {FormBuilder} _formBuilder
     * @param {Router} _router
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router
    ) {
        // Set the defaults
        this.message = null;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email: [null, [Validators.required, Validators.email]],
            password: [null, Validators.required],
            rememberMe: [null]
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Hide the message
        this.message = null;

        // Do nothing if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Get the credentials
        const credentials = this.signInForm.value;

        // Sign in
        this._authService.signIn(credentials)
            .subscribe(() => {

                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the request and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);

            }, (response) => {

                // Re-enable the form
                this.signInForm.enable();

                // Show the error message
                this.message = {
                    appearance: 'outline',
                    title: 'Ошибка авторизации',
                    content: response.error.message,
                    shake: true,
                    showIcon: false,
                    type: 'warn'
                };
            });
    }
}
