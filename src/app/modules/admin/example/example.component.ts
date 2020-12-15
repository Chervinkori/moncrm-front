import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
    selector: 'example',
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent {
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {
    }

    sendRequest(): void {
        this._httpClient.get('backend/out/home').subscribe();
    }
}
