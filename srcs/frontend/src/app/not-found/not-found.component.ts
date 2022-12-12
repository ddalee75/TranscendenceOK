import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found-',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  show:boolean =false;
  constructor(public router:Router) { }

  ngOnInit(): void {
  }

  showWFT(){
    this.show=!this.show;
    
  }


  home(){
    this.router.navigate(["home"]);
  }
}
