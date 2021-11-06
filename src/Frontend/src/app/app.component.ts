import { Component } from '@angular/core';
import { ArticleService } from './article.service';
import { OrderService } from './order.service';
declare const M: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Codemotion 2021';

  constructor(private articleSrv: ArticleService, private ordersSrv: OrderService) { }

  ngAfterViewInit(): void {
    M.AutoInit();
    this.articleSrv.getAllArticles();
    this.ordersSrv.getAllOrders();
  }
}
