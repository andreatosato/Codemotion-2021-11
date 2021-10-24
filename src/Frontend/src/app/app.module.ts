import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ArticlesComponent } from './articles/articles.component';
import { OrdersComponent } from './orders/orders.component';
import { HttpClientModule } from '@angular/common/http';
import { OpenTelemetryInterceptorModule, OtelColExporterModule, CompositePropagatorModule, ZipkinExporterModule } from '@jufab/opentelemetry-angular-interceptor';
import { environment } from './../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    ArticlesComponent,
    OrdersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    OpenTelemetryInterceptorModule.forRoot(environment.openTelemetryConfig),
    ZipkinExporterModule,
    CompositePropagatorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
