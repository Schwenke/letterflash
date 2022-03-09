import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {

  @Output() closeButtonClicked = new EventEmitter<boolean>();
  
  constructor() { }

  ngOnInit(): void {

  }

  closePanel(): void {
    this.closeButtonClicked.emit(true);
  }

}
