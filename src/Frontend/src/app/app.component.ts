import { Component } from '@angular/core';
declare const M: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Codemotion 2021';

  ngAfterViewInit(): void {
    M.AutoInit();
  }
}
