import { Component, ViewChild, ElementRef, Input, SimpleChanges, SimpleChange, Output, EventEmitter, KeyValueDiffers } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CommonsService } from '../commons.service';
interface Pokemon {
  value: string;
  viewValue: string;
}

interface PokemonGroup {
  disabled?: boolean;
  name: string;
  pokemon: Pokemon[];
}
interface Selection {
  id: string;
  selected: boolean;
}
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css']
})

export class DropdownComponent {
  differ: any;
  groupdiffer: any;
  constructor(private commons: CommonsService,private differs: KeyValueDiffers) { 
    this.differ = differs.find({}).create();
    this.groupdiffer = differs.find({}).create();
  }

  @Input()
  masterMap;
  @Input()
  nodeIdMap;
  @Input()
  nodeTypeVisibilityMap;
  @Output()
  updateSelection: EventEmitter<Selection> = new EventEmitter()
  ngDoCheck(){
    let changes = this.differ.diff(this.nodeIdMap);
		if(changes) {
			//console.log('changes detected');
			// changes.forEachChangedItem(r => console.log(r,' changed ', r.currentValue));
			// changes.forEachAddedItem(r => console.log(r,' added ' + r.currentValue));
      // changes.forEachRemovedItem(r => console.log(r,' removed ' + r.currentValue));
      changes.forEachChangedItem(r => {
        if(r.currentValue){
          this.selectedValues.push(r.key)
          this.selectFormControl.patchValue(this.selectedValues);
        }
        else{
          this.selectedValues.splice(this.selectedValues.indexOf(r.key),1)
          this.selectFormControl.patchValue(this.selectedValues);
        }
      })
		} else {
			//console.log('nothing changed');
    }
    
    let groupchanges = this.groupdiffer.diff(this.nodeTypeVisibilityMap)
    if(groupchanges) {
			console.log('changes detected');
			// changes.forEachChangedItem(r => console.log(r,' changed ', r.currentValue));
			// changes.forEachAddedItem(r => console.log(r,' added ' + r.currentValue));
      // changes.forEachRemovedItem(r => console.log(r,' removed ' + r.currentValue));
      groupchanges.forEachChangedItem(r => {
        this.data.forEach(group=>{
          if(group.name==r.key){
            group.disabled = !r.currentValue;
          }
        })
      })
		} else {
			//console.log('nothing changed');
    }
  }
  ngOnChanges(changes: SimpleChanges) {
      if(changes.masterMap){
        console.log('prev value: ', changes.masterMap.previousValue);
        console.log('got item: ', changes.masterMap.currentValue);
        this.processMasterMap(changes.masterMap.currentValue)
      }
  }
  processMasterMap(newVal){
    let typeList = []
    let idList = []
    let newData = []
    for(let key in newVal){
      idList.push(key)
      if(typeList.indexOf(this.commons.getNodeTypeById(key))==-1){
        typeList.push(this.commons.getNodeTypeById(key))
        newData.push({name:this.commons.getNodeTypeById(key),pokemon:[]})
      }
    }
    idList.sort();
    for(let key in newVal){
      newData.forEach(typeobj=>{
        if(typeobj.name==this.commons.getNodeTypeById(key)){
          typeobj.pokemon.push({value:key,viewValue:newVal[key].name})
        }
      })
    }
    this.data = newData;
  }

  @ViewChild('search') searchTextBox: ElementRef;

  selectFormControl = new FormControl();
  searchTextboxControl = new FormControl();
  selectedValues = [];
  /*data: string[] = [
    'A1',
    'A2',
    'A3',
    'B1',
    'B2',
    'B3',
    'C1',
    'C2',
    'C3'
  ]*/

  filteredOptions: Observable<any[]>;


  
  //pokemonControl = new FormControl();
  data= [];
  // PokemonGroup[] = [
  //   {
  //     name: 'Grass',
  //     pokemon: [
  //       {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
  //       {value: 'oddish-1', viewValue: 'Oddish'},
  //       {value: 'bellsprout-2', viewValue: 'Bellsprout'}
  //     ]
  //   },
  //   {
  //     name: 'Water',
  //     pokemon: [
  //       {value: 'squirtle-3', viewValue: 'Squirtle'},
  //       {value: 'psyduck-4', viewValue: 'Psyduck'},
  //       {value: 'horsea-5', viewValue: 'Horsea'}
  //     ]
  //   },
  //   {
  //     name: 'Fire',
  //     // disabled: true,
  //     pokemon: [
  //       {value: 'charmander-6', viewValue: 'Charmander'},
  //       {value: 'vulpix-7', viewValue: 'Vulpix'},
  //       {value: 'flareon-8', viewValue: 'Flareon'}
  //     ]
  //   },
  //   {
  //     name: 'Psychic',
  //     pokemon: [
  //       {value: 'mew-9', viewValue: 'Mew'},
  //       {value: 'mewtwo-10', viewValue: 'Mewtwo'},
  //     ]
  //   }
  // ];

  

  ngOnInit() {
    /**
     * Set filter event based on value changes 
     */
    this.filteredOptions = this.searchTextboxControl.valueChanges
      .pipe(
        startWith<string>(''),
        map(name => this._filter(name))
      );
  }

  /**
   * Used to filter data based on search input 
   */
  filteredList = [];
  private _filter(name: string): String[] {
    const filterValue = name.toLowerCase();
    // Set selected values to retain the selected checkbox state 
    this.setSelectedValues();
    this.selectFormControl.patchValue(this.selectedValues);
    //let filteredList = this.data.filter(option => option.toLowerCase().indexOf(filterValue) !== -1);
    let newList = []
    this.data.forEach(group => {
      let tmp = {name:group.name,pokemon:[],disabled:group.disabled}
      
      group.pokemon.forEach(mon=>{
        if(group.name.toLowerCase().indexOf(name.toLowerCase())!=-1||mon.viewValue.toLowerCase().indexOf(name.toLowerCase())!=-1||mon.value.toLowerCase().indexOf(name.toLowerCase())!=-1){
          tmp.pokemon.push(mon)
        }
      })
      if(tmp.pokemon.length>0){
        newList.push(tmp)
      }
      
    });
    this.filteredList = newList;
    return this.filteredList;
  }

/**
 * Remove from selected values based on uncheck
 */
  deselectAll(){
    console.log(this.filteredList)
    this.filteredList.forEach(opt=>{
      if(!opt.disabled){
        opt.pokemon.forEach(searchedNode=>{
          console.log(searchedNode)
          if(this.selectedValues.indexOf(searchedNode.value)!=-1){
            //let index = this.selectedValues.indexOf(searchedNode.value);
            //this.selectedValues.splice(index, 1)
            this.updateSelection.emit({id:searchedNode.value,selected:false})
            //this.selectFormControl.patchValue(this.selectedValues);
          }
        })
      }
    })
    this.searchTextboxControl.patchValue(this.searchTextboxControl.value)
  }
  selectAll(){
    console.log(this.filteredList)
    this.filteredList.forEach(opt=>{
      if(!opt.disabled){
        opt.pokemon.forEach(searchedNode=>{
          console.log(searchedNode)
          if(this.selectedValues.indexOf(searchedNode.value)==-1){
            //this.selectedValues.push(searchedNode.value);
            this.updateSelection.emit({id:searchedNode.value,selected:true})
            //this.selectFormControl.patchValue(this.selectedValues);
          }
        })
      }
    })
    this.searchTextboxControl.patchValue(this.searchTextboxControl.value)
  }
  selectionChange(event) {
    if(event.source.value=='all'){
      // if (event.isUserInput){
      //   if(event.source.selected == false) {
      //     this.filteredList.forEach(opt=>{
      //       opt.pokemon.forEach(searchedNode=>{
      //         let index = this.selectedValues.indexOf(searchedNode.id);
      //         this.selectedValues.splice(index, 1)
      //       })
      //     })
      //     // let index = this.selectedValues.indexOf(event.source.value);
      //     // this.selectedValues.splice(index, 1)
      //   }
      //   else if(event.source.selected == true){
      //     this.filteredList.forEach(opt=>{
      //       opt.pokemon.forEach(searchedNode=>{
      //         this.updateSelection.emit({id:searchedNode.value,selected:true})
      //         if(this.selectedValues.indexOf(searchedNode.value)==-1){
      //           this.selectedValues.push(searchedNode.value)
      //         }
      //       })
      //     })
      //   }
      //   // this.updateSelection.emit({id:event.source.value,selected:event.source.selected})
      // }
    }
    else{
      if (event.isUserInput){
        if(event.source.selected == false) {
          let index = this.selectedValues.indexOf(event.source.value);
          this.selectedValues.splice(index, 1)
        }
        else if(event.source.selected == true){
  
        }
        this.updateSelection.emit({id:event.source.value,selected:event.source.selected})
      }
    }
  }

  openedChange(e) {
    // Set search textbox value as empty while opening selectbox 
    this.searchTextboxControl.patchValue('');
    // Focus to search textbox while clicking on selectbox
    if (e == true) {
      this.searchTextBox.nativeElement.focus();
    }
  }

  /**
   * Clearing search textbox value 
   */
  clearSearch(event) {
    event.stopPropagation();
    this.searchTextboxControl.patchValue('');
  }

  /**
   * Set selected values to retain the state 
   */
  setSelectedValues() {
    console.log('selectFormControl', this.selectFormControl.value);
    if (this.selectFormControl.value && this.selectFormControl.value.length > 0) {
      this.selectFormControl.value.forEach((e) => {
        if (this.selectedValues.indexOf(e) == -1) {
          this.selectedValues.push(e);
        }
      });
    }
  }

}
