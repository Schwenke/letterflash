import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GameBoardComponent } from './components/game-board/game-board.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { ResultsDialogComponent } from './components/results-dialog/results-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSidenavModule } from "@angular/material/sidenav";
import { HttpClientModule } from "@angular/common/http";
import { KeyboardComponent } from './components/keyboard/keyboard.component';
import { OptionsComponent } from './components/options/options.component';
import { FaqComponent } from './components/faq/faq.component';
import { HistoryComponent } from './components/history/history.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { StatsComponent } from './components/stats/stats.component';
import { MatIconModule } from '@angular/material/icon';
import { AboutComponent } from './components/about/about.component';
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";

@NgModule({
  declarations: [
    AppComponent,
    GameBoardComponent,
    ResultsDialogComponent,
    KeyboardComponent,
    OptionsComponent,
    FaqComponent,
    HistoryComponent,
    StatsComponent,
    AboutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDividerModule,
    MatRadioModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
    MatBottomSheetModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
