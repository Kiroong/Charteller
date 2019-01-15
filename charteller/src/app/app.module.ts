import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { IndexComponent } from './index/index.component';
import { AppRoutingModule } from './app-routing.module';
import { NavigateComponent } from './navigate/navigate.component';
import { DescriptionComponent } from './description/description.component';
import { KeyboardInputComponent } from './keyboard-input/keyboard-input.component';
import { ChartSpecComponent } from './chart-spec/chart-spec.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexComponent,
    NavigateComponent,
    DescriptionComponent,
    KeyboardInputComponent,
    ChartSpecComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
