import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  readonly appName = environment.appName;
  readonly appVersion = environment.appVersion;
  readonly apiBaseUrl = environment.apiBaseUrl;
  
  readonly storageKeys = environment.storageKeys;
  readonly fileUpload = environment.fileUpload;
  readonly pagination = environment.pagination;
  readonly sopStatuses = environment.sopStatuses;
  readonly userRoles = environment.userRoles;
  readonly dateFormats = environment.dateFormats;
  readonly animation = environment.animation;
  readonly breakpoints = environment.breakpoints;
  readonly toastDurationMs = environment.toastDurationMs;
  readonly debounce = environment.debounce;
  
  constructor() {}
}