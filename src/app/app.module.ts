import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
// import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import {  MatFormFieldModule } from '@angular/material/form-field'
import {  MatInputModule } from '@angular/material/input'
import {MatSelectModule} from '@angular/material/select'
import {MatToolbarModule} from '@angular/material/toolbar'
import { DropdownComponent } from './dropdown/dropdown.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule} from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import {FlexLayoutModule, FlexModule} from '@angular/flex-layout';
import { DialogComponentComponent } from './dialog-component/dialog-component.component'
import {MatDialogModule} from '@angular/material/dialog';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    AppComponent,
    DropdownComponent,
    DialogComponentComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatToolbarModule,
    MatIconModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    MatButtonModule,
    AppRoutingModule,
    //NgMultiSelectDropDownModule.forRoot(),
    BrowserAnimationsModule,
    FlexLayoutModule, FlexModule,
    //AngularMultiSelectModule,
    MatFormFieldModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
