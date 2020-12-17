import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {TreoAnimations} from '@treo/animations';
import {AuthService} from 'app/core/auth/auth.service';
import {HttpClient} from '@angular/common/http';
import {ErrorResponse, SuccessResponse} from '../../../interface/response-backend';
import {finalize} from 'rxjs/operators';
import {Router} from '@angular/router';

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

    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _httpClient: HttpClient,
        private _router: Router
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
                lastname: [null, Validators.required],
                firstname: [null, Validators.required],
                middlename: [null],
                email: [null, [Validators.required, Validators.email]],
                password: [null, Validators.required],
                agreements: [true, Validators.requiredTrue] // TODO
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
        // Hide the message
        this.message = null;

        // Do nothing if the form is invalid
        if (this.signUpForm.invalid) {
            return;
        }

        // Disable the form
        this.signUpForm.disable();

        // TODO: перенести в сервис (!)
        this._httpClient.post('backend/auth/register', this.signUpForm.value).pipe(
            finalize(() => {
                // Re-enable the form
                this.signUpForm.enable();
            })
        ).subscribe(
            (response: SuccessResponse) => {
                // Reset the form
                this.signUpForm.reset({});
                // Переход
                this._router.navigate(['confirmation-required']);
            },
            (response: ErrorResponse) => {
                this.message = {
                    appearance: 'outline',
                    title: 'Ошибка регистрации',
                    content: response.error.data[0].message ?? response.error.message, // TODO: сделать автоматический вывод ошибок валидации
                    shake: true,
                    showIcon: false,
                    type: 'warn'
                };
            }
        );
    }
}
