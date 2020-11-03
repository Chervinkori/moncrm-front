import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { TreoAnimations } from '@treo/animations';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorResponse, ISuccessResponse } from '@interfaces/response.interface';
import { ISignUpSuccessResponseDto } from '@core/auth/auth.dto';

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: TreoAnimations
})
export class AuthSignUpComponent implements OnInit, OnDestroy {
    message: any;
    signUpForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {AuthService} _authService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder
    ) {
        // Set the defaults
        this.message = null;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            company: [''],
            agreements: ['', Validators.requiredTrue]
        }
        );
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Do nothing if the form is invalid
        if (this.signUpForm.invalid) {
            this.signUpForm.markAllAsTouched();
            // Show the message
            this.message = {
                appearance: 'outline',
                content: 'Ошибка заполнения формы регистрации',
                shake: true,
                showIcon: false,
                type: 'error'
            };
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // Hide the message
        this.message = null;

        this._authService.signUp(this.signUpForm.value).subscribe((response: ISuccessResponse<ISignUpSuccessResponseDto>) => {
            this.signUpForm.enable();
            this.signUpForm.reset();
            this.message = {
                appearance: 'outline',
                content: `Аккаунт зарегистрирован. На почту по адресу ${response.data.email} выслано письмо для подтверждения`,
                shake: true,
                showIcon: false,
                type: 'success'
            };
        }, (error: ErrorResponse) => {
            this.signUpForm.enable();
            this.message = {
                appearance: 'outline',
                content: error.title,
                shake: true,
                showIcon: false,
                type: 'error'
            };
        })
    }
}
