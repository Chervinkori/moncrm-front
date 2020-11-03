export interface ISuccessResponse<T> {
    meta?: any;
    data: T;
}

export class ErrorResponse {
    
    public title: string;
    public details: string; 

    constructor(error: { title: string; details?: string }) {
        this.title = error.title;
        this.details = error.details;
        Object.setPrototypeOf(this, ErrorResponse.prototype);
    }
}