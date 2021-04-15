import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { CommonsService } from '../commons.service';


@Component({
  selector: 'app-dialog-component',
  templateUrl: './dialog-component.component.html',
  styleUrls: ['./dialog-component.component.css']
})

export class DialogComponentComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data, public commons: CommonsService) {}

  ngOnInit(): void {
  }

}
