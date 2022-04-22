import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { DarkModeClassName } from 'src/app/constants';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  darkMode: boolean = false;
  
  constructor(
    private bottomSheetRef: MatBottomSheetRef<AboutComponent>,
    private sessionService: SessionService,
    private overlayContainer: OverlayContainer
  ) { 
    this.sessionService.session.subscribe(session => {
      if (!session) return;

      this.darkMode = session.options.darkMode;

      if (this.darkMode) {
        this.overlayContainer.getContainerElement().classList.add(DarkModeClassName);
      } else {
        this.overlayContainer.getContainerElement().classList.remove(DarkModeClassName);
      }
    });
  }

  ngOnInit(): void {

  }

  closePanel(): void {
    this.bottomSheetRef.dismiss();
  }

}
