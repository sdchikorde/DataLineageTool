/*
Documentation by Siddharth Chikorde

In order to add any new type of entity in the tool, you need to make following changes:
1. Array of those objects
e.g. operations = [{...},..]
2. Define look and feel for new object type in following maps
nodeColorMap, nodeIconMap, nodeTypeVisibilityMap, nodeSizeMap
3. Define id based map object
e.g. operationsMap = {};
4. Define your type name in function commons.getNodeTypeById(id: string)
5. Refer your map object in function getNodeById
6. Define link behaviour for this new object type with other object types in function addLinkForGraph
7. Also add UI elements for this entity (visibility marker)
*/

import { Component, ViewChild, ElementRef, ɵɵtrustConstantResourceUrl } from "@angular/core";
import {FormControl} from '@angular/forms';
import {MatFormFieldModule,MatFormFieldControl} from '@angular/material/form-field';
import {MatSelect} from '@angular/material/select';
import {MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';



import * as d3 from "d3";
import { selection, select } from "d3-selection";
import "d3-selection-multi";
import * as d3drag from "d3-drag";
import * as d3scalechromatic from "d3-scale-chromatic";
import "d3-force";
import "d3-zoom";

import { CommonsService } from './commons.service';
import { DialogComponentComponent } from './dialog-component/dialog-component.component';
interface Pokemon {
  value: string;
  viewValue: string;
}

interface PokemonGroup {
  disabled?: boolean;
  name: string;
  pokemon: Pokemon[];
}
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  //pokemonControl = new FormControl();
  pokemonGroups: PokemonGroup[] = [
    {
      name: 'Grass',
      pokemon: [
        {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
        {value: 'oddish-1', viewValue: 'Oddish'},
        {value: 'bellsprout-2', viewValue: 'Bellsprout'}
      ]
    },
    {
      name: 'Water',
      pokemon: [
        {value: 'squirtle-3', viewValue: 'Squirtle'},
        {value: 'psyduck-4', viewValue: 'Psyduck'},
        {value: 'horsea-5', viewValue: 'Horsea'}
      ]
    },
    {
      name: 'Fire',
      disabled: true,
      pokemon: [
        {value: 'charmander-6', viewValue: 'Charmander'},
        {value: 'vulpix-7', viewValue: 'Vulpix'},
        {value: 'flareon-8', viewValue: 'Flareon'}
      ]
    },
    {
      name: 'Psychic',
      pokemon: [
        {value: 'mew-9', viewValue: 'Mew'},
        {value: 'mewtwo-10', viewValue: 'Mewtwo'},
      ]
    }
  ];
  

  showImage = "data:image/png;base64,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";
  hideImage = "data:image/png;base64,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";
  constructor(private hostElement: ElementRef, private commons: CommonsService, public dialog: MatDialog, public snack: MatSnackBar) {
    this.systems = commons.systems;
    this.tables = commons.tables;
    this.views = commons.views;
    this.operations = commons.operations;
    this.feeds = commons.feeds;
    this.snack.open("Concept & Development by Siddharth Chikorde", "", {
      duration: 6000,
    });
  }
  
  @ViewChild('svgElement')
  svgElement: ElementRef;
  
  nodeSelectionUpdate(e){
    if(e.selected){
      this.addNodeForGraph(e.id,false)
    }
    else{
      this.removeNode(e.id,false);
    }
  }

  printnodelink(){
    console.log(this.link,this.node)
  }
  
  name = "DLT";
  index = 10;
  parse(obj) {
    return JSON.stringify(obj);
  }
  selectedNodeId = "";
  setSelectedNodeId(id){
    this.selectedNodeId = id;
  }
  itemList = [];
  selectedItems = [];
  settings = {};
  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }

  ngOnInit() {
    this.itemList = [
      { "id": 1, "itemName": "India", "category": "asia" },
      { "id": 2, "itemName": "Singapore", "category": "asia pacific" },
      { "id": 3, "itemName": "Germany", "category": "Europe" },
      { "id": 4, "itemName": "France", "category": "Europe" },
      { "id": 5, "itemName": "South Korea", "category": "asia" },
      { "id": 6, "itemName": "Sweden", "category": "Europe" }
    ];

    this.selectedItems = [
      { "id": 1, "itemName": "India" },
      { "id": 2, "itemName": "Singapore" },
      { "id": 4, "itemName": "Canada" }];
    this.settings = {
      singleSelection: false,
      text: "Select Fields",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      searchPlaceholderText: 'Search Fields',
      enableSearchFilter: true,
      badgeShowLimit: 3,
      groupBy: "category"
    };
    
  }
  ///////////////////////////////My Data and Functions/////////////////////////////////////////
  currentSystem = "sys000000";
  masterMap = {}

  // systems = [
  //   //{
  //   //  name: "F1 Tax",
  //   //  icto: "ICTO-32543",
  //   //  region: "Global",
  //   //  poc: ["f1tax.support@cs.com", "f1tax.l1@cs.com"],
  //   //  id: "sys000000"
  //   //},
  //   {
  //     name: "CDM",
  //     icto: "ICTO-32443",
  //     region: "Swiss",
  //     poc: ["cdm.support@cs.com", "cdm.l1.distribution.list@cs.com"],
  //     id: "sys000001"
  //   },
  //   {
  //     name: "OOXP",
  //     icto: "N/A",
  //     region: "Global",
  //     poc: ["ooxp.admin@cs.com"],
  //     id: "sys000002"
  //   }
  // ];
  // feeds = [
  //   {
  //     name: "RWA FINMA Group",
  //     direction: "inbound",
  //     description: "Risk Weighted Assets for FINMA Group level",
  //     filenameregex: "rwa_finma_<YYYYMMDD>.csv",
  //     filenamesample: "rwa_finma_20201231.csv",
  //     type: "FTPS",
  //     attributes: [
  //       { name: "attr1", type: "string", comments: "" },
  //       { name: "attr2", type: "string", comments: "" },
  //       { name: "attr3", type: "string", comments: "" }
  //     ],
  //     gensysref: "sys000001",
  //     consysref: ["sys000000"], //should be auto-added
  //     id: "fed000001"
  //   },
  //   {
  //     name: "RWA FINMA Parent",
  //     direction: "inbound",
  //     description: "Risk Weighted Assets for FINMA Parent level",
  //     filenameregex: "rwa_finma_parent_<YYYYMMDD>.csv",
  //     filenamesample: "rwa_finma_parent_20201231.csv",
  //     type: "FTPS",
  //     attributes: [
  //       { name: "attr1", type: "string", comments: "" },
  //       { name: "attr2", type: "string", comments: "" },
  //       { name: "attr3", type: "string", comments: "" }
  //     ],
  //     gensysref: "sys000001",
  //     consysref: ["sys000000"], //should be auto-added
  //     id: "fed000002"
  //   },
  //   {
  //     name: "RWA Extract",
  //     direction: "outbound",
  //     description: "Extract for Risk Weighted Assets for FINMA Group",
  //     filenameregex: "<YYYYMMDD>_OPR_RWA.csv",
  //     filenamesample: "20201231_OPR_RWA.csv",
  //     type: "FTPS",
  //     attributes: [
  //       { name: "attr1", type: "string", comments: "" },
  //       { name: "attr2", type: "string", comments: "" },
  //       { name: "attr3", type: "string", comments: "" }
  //     ],
  //     gensysref: "sys000000", //should be auto-added
  //     consysref: ["sys000002"],
  //     id: "fed000003"
  //   }
  // ];
  // operations = [
  //   {
  //     name: "RWA FINMA Group Ingestion",
  //     type: "Ingestion",
  //     description: "",
  //     jobname: "PTP000008I",
  //     jobdatacenter: "PNY01",
  //     frequency: "BD16",
  //     feedref: "fed000001",
  //     tblviewref: [],
  //     outputtblref: "tbl000001",
  //     outputfeedref: null,
  //     filter: false,
  //     aggregate: false,
  //     transpose: false,
  //     id: "opr000001"
  //   },
  //   {
  //     name: "RWA FINMA Group Transformation",
  //     type: "Transformation",
  //     description: "",
  //     jobname: "PTP000008T",
  //     jobdatacenter: "PNY01",
  //     frequency: "BD16",
  //     feedref: null,
  //     tblviewref: ["tbl000001"],
  //     outputtblref: "tbl000002",
  //     outputfeedref: null,
  //     filter: false,
  //     aggregate: false,
  //     transpose: false,
  //     id: "opr000002"
  //   },
  //   {
  //     name: "RWA FINMA Parent Ingestion",
  //     type: "Ingestion",
  //     description: "",
  //     jobname: "PTP000011I",
  //     jobdatacenter: "PNY01",
  //     frequency: "BD19",
  //     feedref: "fed000002",
  //     tblviewref: [],
  //     outputtblref: "tbl000003",
  //     outputfeedref: null,
  //     filter: false,
  //     aggregate: false,
  //     transpose: false,
  //     id: "opr000003"
  //   },
  //   {
  //     name: "RWA FINMA Parent Transformation",
  //     type: "Transformation",
  //     description: "",
  //     jobname: "PTP000011T",
  //     jobdatacenter: "PNY01",
  //     frequency: "BD19",
  //     feedref: null,
  //     tblviewref: ["tbl000003"],
  //     outputtblref: "tbl000004",
  //     outputfeedref: null,
  //     filter: false,
  //     aggregate: false,
  //     transpose: false,
  //     id: "opr000004"
  //   },
  //   {
  //     name: "RWA FINMA Extract",
  //     type: "Extraction",
  //     description: "",
  //     jobname: "PTPBATCH01",
  //     jobdatacenter: "PNY01",
  //     frequency: "BD19",
  //     feedref: null,
  //     tblviewref: ["tbl000002", "tbl000004"],
  //     outputtblref: null,
  //     outputfeedref: "fed000003",
  //     filter: true,
  //     aggregate: false,
  //     transpose: false,
  //     id: "opr000005"
  //   }
  // ];
  // tables = [
  //   {
  //     name: "dhtax_tp_rwa_finma_stg",
  //     schema: "gbtax",
  //     db: "F1",
  //     partitionInfo: [],
  //     attributes: [
  //       { name: "col1", type: "string", comments: "" },
  //       { name: "col2", type: "string", comments: "" },
  //       { name: "col3", type: "string", comments: "" }
  //     ],
  //     id: "tbl000001"
  //   },
  //   {
  //     name: "dhtax_tp_rwa_finma",
  //     schema: "gbtax",
  //     db: "F1",
  //     partitionInfo: [],
  //     attributes: [
  //       { name: "col1", type: "string", comments: "" },
  //       { name: "col2", type: "string", comments: "" },
  //       { name: "col3", type: "string", comments: "" }
  //     ],
  //     id: "tbl000002"
  //   },
  //   {
  //     name: "dhtax_tp_rwa_finma_parent_stg",
  //     schema: "gbtax",
  //     db: "F1",
  //     partitionInfo: [],
  //     attributes: [
  //       { name: "col1", type: "string", comments: "" },
  //       { name: "col2", type: "string", comments: "" },
  //       { name: "col3", type: "string", comments: "" }
  //     ],
  //     id: "tbl000003"
  //   },
  //   {
  //     name: "dhtax_tp_rwa_finma_parent",
  //     schema: "gbtax",
  //     db: "F1",
  //     partitionInfo: [],
  //     attributes: [
  //       { name: "col1", type: "string", comments: "" },
  //       { name: "col2", type: "string", comments: "" },
  //       { name: "col3", type: "string", comments: "" }
  //     ],
  //     id: "tbl000004"
  //   }
  // ];
  // views = [
  //   {
  //     name: "dhtax_dummy_view",
  //     schema: "gbtax",
  //     db: "F1",
  //     attributes: [
  //       { name: "col1", type: "string", comments: "" },
  //       { name: "col2", type: "string", comments: "" },
  //       { name: "col3", type: "string", comments: "" }
  //     ],
  //     tblviewref: ['tbl000002','tbl000004'],
  //     id: "viw000001"
  //   }
  // ]
  tables:any
  systems:any
  views:any
  operations:any
  feeds:any

  defaultNodeColor = "black";
  defaultNodeSize = 10;

  nodeColorMap = {
    system: "red",
    feed: "blue",
    table: "orage",
    operation: "yellow",
    view: "green"
  };
  nodeIconMap = {
    system: "🏛️",
    feed: "🧾",
    table: "𝄜",
    operation: "⚙️",
    view: "👁"
  }
  nodeTypeVisibilityMap = {
    system: true,
    feed: true,
    table: true,
    operation: true,
    view: true
  }
  clearAll(){
    this.nodes.forEach(node=>{
      this.removeNode(node.id,false)
    })
  }
  rebuildLinks(){
    //remove all existing visible links
    this.links = []
    //rebuild the links by traversing DFS
    this.nodes.forEach(item=>{
      let tmp = this.dfsLinkSearch(item.id);
      // //deactivate this if condition and only keep else if you want to keep single type association intact irrespective of visibility of other node types whose no node is selected
      // if(tmp.length==0){
      //   this.links = this.links
      // }
      //else{
        tmp.forEach(arr=>{
          if(arr.length>0){
            let fwdkey = arr.pop()
            console.log(item.id,fwdkey,arr)
            this.addLinkForGraph(item.id,fwdkey,arr)
          }
        })
      //}
    })
    this.update()
  }
  dfsLinkSearch(id){
    let currNode = this.masterMap[id]
    let outputlinks = []
    let retlinks;
    let tmp;
    currNode.forwardnodes.forEach(fwdid=>{
      if(this.nodeTypeVisibilityMap[this.commons.getNodeTypeById(fwdid)]==false){
        retlinks = this.dfsLinkSearch(fwdid)
        if(retlinks.length>0){
          retlinks.forEach(retlinkarr=>{
            tmp = [];
            tmp.push(fwdid)
            retlinkarr.forEach(element => {
              tmp.push(element)
            });
            outputlinks.push(tmp)
          })
        }
      }
      else if(this.nodeIdMap[fwdid]){
        outputlinks.push([fwdid])
      }
    })
    return outputlinks;
  }
  showNodeType(type:string){
    this.nodeTypeVisibilityMap[type] = true;
    //find nodes of this type which were previously visible
    let nodesToShowAgain = []
    for(let key in this.nodeIdMap){
      if(this.nodeIdMap[key]&&this.commons.getNodeTypeById(key)==type){
        nodesToShowAgain.push(key)
        this.nodeIdMap[key] = false;
      }
    }
    /*
    //amongst existing visible links, break and make new links where intermediate contains one of the above nodes
    let oldLinks = []
    this.links.forEach(lnk=>{oldLinks.push(lnk)})
    let newLinks = []

    for(let i = 0; i < oldLinks.length; i++){
      let lnk = oldLinks[i]
      let broken = false;
      if(lnk.intermediate.length>0){
        let originalsource;
        let origlen;
        let point;
        let right;
        let left;
        let originaltarget;
        for (let index = 0; index < lnk.intermediate.length; index++) {
          if(nodesToShowAgain.indexOf(lnk.intermediate[index])!=-1){
            originalsource = lnk.source;
            origlen = lnk.intermediate.length;
            point = lnk.intermediate[index]
            right = lnk.intermediate.splice(index+1,origlen)
            left = lnk.intermediate.splice(0,index)
            originaltarget = lnk.target;

            broken = true;
            break;
          }
        }
        if(broken){
          oldLinks.push({source:lnk.source,target:point,intermediate:left})
          oldLinks.push({source:point,target:originaltarget,intermediate:right})
          oldLinks.splice(i,1)
          i--;
        }
        else{
          newLinks.push({source:lnk.source,target:lnk.target,intermediate:lnk.intermediate})
        }
      }
      else{
        newLinks.push({source:lnk.source,target:lnk.target,intermediate:lnk.intermediate})
      }
    }
    console.log('New Link Set will be ',newLinks)
    */
    nodesToShowAgain.forEach(key=>{
      this.addNodeForGraph(key,false,true)
    })
    this.rebuildLinks()
    /*this.links = newLinks;
    this.update();*/
    /*
    this.links = []
    newLinks.forEach(item=>{
      this.addLinkForGraph(item.source,item.target,item.intermediate)
    })
    */
  }
  hideNodeType(type:string){
    this.nodeTypeVisibilityMap[type] = false;
    //first remove all nodes of this type and their links from graph
    let nodesToHide = this.nodes.filter((item)=>{
      return this.commons.getNodeTypeById(item.id)==type;
    })
    nodesToHide.forEach(item=>{
      this.removeNode(item.id, true)
    })

    this.rebuildLinks()
    // for(let key in this.masterMap){
    //   if(this.nodeIdMap[key]&&this.nodeTypeVisibilityMap[this.commons.getNodeTypeById(key)]){
    //     let tmp = this.rebuildLinks(key);
    //     if(tmp.length>0){
    //       let fwdkey = tmp.pop()
    //       console.log(key,fwdkey,tmp)
    //       this.addLinkForGraph(key,fwdkey,tmp)
    //     }
    //   }
    // }

    //////////////////////////////////////////////////////////////////
    /*
    //first remove all nodes of this type and their links from graph
    let nodesToHide = this.nodes.filter((item)=>{
      return this.commons.getNodeTypeById(item.id)==type;
    })
    nodesToHide.forEach(item=>{
      this.removeNode(item.id, true)
    })
    
    this.nodes.forEach(node=>{
      //for all remaining nodes
      //bfs untill node of visible type found

    })*/





    /////////////////////////////////////////////////////////////////////


    // //have a list of currently visible nodes of this type
    // let nodesToHide = this.nodes.filter((item)=>{
    //   return this.commons.getNodeTypeById(item.id)==type;
    // })
    
    // let newLinks = []
    // //now it is time to link it's visible fwd to visible bwd
    // ///*nodesToHide.forEach(item=>{
    // //  item.forwardnodes.forEach(fwdnode=>{
    // //    if(this.nodeIdMap[fwdnode]){
    // //      item.backwardnodes.forEach(bwdnode=>{
    // //        if(this.nodeIdMap[bwdnode]){
    // //          
    // //        }
    // //      })
    // //    }
    // //  })
    // //})*/
    // nodesToHide.forEach(item=>{
    //   let fwdLinks = this.links.filter(lnk=>{return lnk.source.id==item.id})
    //   let bwdLinks = this.links.filter(lnk=>{return lnk.target.id==item.id})
    //   let fwdNodes = []
    //   let bwdNodes = []
    //   fwdLinks.forEach(lnk=>{
    //     fwdNodes.push({id:lnk.target.id,intermediate:lnk.intermediate})
    //   })
    //   bwdLinks.forEach(lnk=>{
    //     bwdNodes.push({id:lnk.source.id,intermediate:lnk.intermediate})
    //   })
      
    //   let tmp = []
    //   bwdNodes.forEach(bwd=>{
    //     tmp = []
    //     bwd.intermediate.forEach(i=>{tmp.push(i)})
    //     tmp.push(item.id)
    //     fwdNodes.forEach(fwd=>{
    //       fwd.intermediate.forEach(i=>{tmp.push(i)})
    //       newLinks.push({source:bwd.id,target:fwd.id,intermediate:tmp.filter(j=>{return true})})
    //     })
    //   })
    // })
    // console.log(newLinks)
    // //hide those nodes and links if any
    // nodesToHide.forEach(item=>{
    //   this.removeNode(item.id,true)
    // })
    // newLinks.forEach(item=>{
    //   this.addLinkForGraph(item.source,item.target,item.intermediate)
    // })

  }
  toggleNodeVisibility(type:string){
    if(this.nodeTypeVisibilityMap[type]){
      this.hideNodeType(type)
    }
    else{
      this.showNodeType(type)
    }
  }

  getNodeColor(type: string) {
    return this.nodeColorMap[type]
      ? this.nodeColorMap[type]
      : this.defaultNodeColor;
  }

  nodeSizeMap = { system: 12, feed: 12, table: 12, operation: 12, view: 12 };
  getNodeSize(type: string) {
    return this.nodeSizeMap[type]
      ? this.nodeSizeMap[type]
      : this.defaultNodeSize;
  }

  nodeIdMap = {};
  systemsMap = {};
  feedsMap = {};
  tablesMap = {};
  operationsMap = {};
  viewsMap = {};
  openDialog(obj,masterMap) {
    this.dialog.open(DialogComponentComponent, {
      // height: '80%',
      // width: '80%',
      data: {node:obj,nodeMap:masterMap}
    });
  }
  removeNode(id,keepInMap:boolean){
    if(!keepInMap){
      this.nodeIdMap[id] = false;
    }
    if(this.selectedNodeId == id){
      this.setSelectedNodeId("");
    }
    this.nodes = this.nodes.filter(function(item) {
      return item.id != id;
    });
    this.links = this.links.filter(function(item) {
      return (item.source.id?item.source.id!=id:item.source!=id) && (item.target.id?item.target.id!=id:item.target!=id);
    });
    this.update()
  }
  addAllForwardNodes(id,recursive){
    if(!recursive){
      this.getNodeById(id).forwardnodes.forEach(childid=>{
        this.addNodeForGraph(childid,false)
      })
    }
    else{
      let stack = [id]
      let processed = []
      let currentId
      while(stack.length>0){
        currentId = stack.shift()
        if(processed.indexOf(currentId)==-1){
          this.getNodeById(currentId).forwardnodes.forEach(childid => stack.push(childid));
          this.addNodeForGraph(currentId,false)
          processed.push(currentId)
        }
      }
      
    }
  }
  addAllBackwardNodes(id,recursive){
    if(!recursive){
      this.getNodeById(id).backwardnodes.forEach(childid=>{
        this.addNodeForGraph(childid,false)
      })
    }
    else{
      let stack = [id]
      let processed = []
      let currentId
      while(stack.length>0){
        currentId = stack.shift()
        if(processed.indexOf(currentId)==-1){
          this.getNodeById(currentId).backwardnodes.forEach(childid => stack.push(childid));
          this.addNodeForGraph(currentId,false)
          processed.push(currentId)
        }
      }
      
    }
  }
  
  getNodeById(id: string) {
    if (this.commons.getNodeTypeById(id) == "system") {
      return this.systemsMap[id];
    } else if (this.commons.getNodeTypeById(id) == "feed") {
      return this.feedsMap[id];
    } else if (this.commons.getNodeTypeById(id) == "table") {
      return this.tablesMap[id];
    } else if (this.commons.getNodeTypeById(id) == "operation") {
      return this.operationsMap[id];
    } else if (this.commons.getNodeTypeById(id) == "view") {
      return this.viewsMap[id];
    }
  }
  linkCount=0
  addNodeForGraph(id: string, select: boolean=true, skiplink: boolean=false) {
    if(this.nodeTypeVisibilityMap[this.commons.getNodeTypeById(id)]){
      if(select){this.setSelectedNodeId(id);}
      if(!this.nodeIdMap[id]){
        let obj = this.getNodeById(id);
        let node = { id: obj.id, name: obj.name, label: this.commons.getNodeTypeById(id) };
        this.nodeIdMap[obj.id] = true;
        this.nodes.push(node);
        console.log(node.id, node.name, node.label);
        
        this.update();

        if(!skiplink){
          /*obj.forwardnodes.forEach(fwdid => {
            if (this.nodeIdMap[fwdid]) this.addLinkForGraph(obj.id, fwdid, []);
          });
          obj.backwardnodes.forEach(bwdid => {
            if (this.nodeIdMap[bwdid]) this.addLinkForGraph(bwdid, obj.id, []);
          });
          console.warn(this.linkCount)*/
          this.rebuildLinks()
        }
      }
    }
  }
  addLinkForGraph(fromId, toId, intermediate:Array<string>) {
    this.linkCount++;
    let fromtype = this.commons.getNodeTypeById(fromId);
    let totype = this.commons.getNodeTypeById(toId);
    let linktype = "";
    if (fromtype == "system" && totype == "feed") {
      linktype = "exports";
    } else if (fromtype == "feed" && totype == "operation") {
      linktype = "consumed";
    } else if (fromtype == "table" && totype == "operation") {
      linktype = "referenced";
    } else if (fromtype == "operation" && totype == "table") {
      linktype = "outputs";
    } else if (fromtype == "table" && totype == "view") {
      linktype = "referenced";
    } else if (fromtype == "operation" && totype == "feed") {
      linktype = "exports";
    } else if (fromtype == "feed" && totype == "system") {
      linktype = "consumed";
    }
    console.log(fromId, toId, linktype);
    this.links.push({ source: fromId, target: toId, type: linktype, intermediate:intermediate});
    this.update();
  }
  addLineage(fromId, toId) {
    this.getNodeById(fromId).forwardnodes.push(toId);
    this.getNodeById(toId).backwardnodes.push(fromId);
  }
  initApp() {
    this.systems.forEach(system => {
      this.systemsMap[system.id] = system;
      system["forwardnodes"] = [];
      system["backwardnodes"] = [];
      this.nodeIdMap[system.id] = false;
      this.masterMap[system.id] = system;
      if (system.id == this.currentSystem) {
        system["disabled"] = true;
      }
    });
    this.tables.forEach(table => {
      this.tablesMap[table.id] = table;
      table["forwardnodes"] = [];
      table["backwardnodes"] = [];
      this.nodeIdMap[table.id] = false;
      this.masterMap[table.id] = table;
    });
    this.views.forEach(view => {
      this.viewsMap[view.id] = view;
      view["forwardnodes"] = [];
      view["backwardnodes"] = [];
      this.nodeIdMap[view.id] = false;
      this.masterMap[view.id] = view;
      view.tblviewref.forEach(tblref => {
        this.addLineage(tblref,view.id);
      });
    });
    this.feeds.forEach(feed => {
      this.feedsMap[feed.id] = feed;
      feed["forwardnodes"] = [];
      feed["backwardnodes"] = [];

      if (feed.direction == "inbound") {
        this.addLineage(feed.gensysref, feed.id);
      }
      if (feed.direction == "outbound") {
        feed.consysref.forEach(sysref => {
          this.addLineage(feed.id, sysref);
        });
      }
      this.nodeIdMap[feed.id] = false;
      this.masterMap[feed.id] = feed;
    });
    this.operations.forEach(operation => {
      this.operationsMap[operation.id] = operation;
      operation["forwardnodes"] = [];
      operation["backwardnodes"] = [];
      if (operation.type == "Ingestion") {
        //feedref
        this.addLineage(operation.feedref, operation.id);
        //tblviewref loop
        operation.tblviewref.forEach(ref => {
          this.addLineage(ref, operation.id);
        });
        //outputtblref
        this.addLineage(operation.id, operation.outputtblref);
      } else if (operation.type == "Transformation") {
        //tblviewref loop
        operation.tblviewref.forEach(ref => {
          this.addLineage(ref, operation.id);
        });
        //outputtblref
        this.addLineage(operation.id, operation.outputtblref);
      } else if (operation.type == "Extraction") {
        //tblviewref
        operation.tblviewref.forEach(ref => {
          this.addLineage(ref, operation.id);
        });
        //outputfeedref
        this.addLineage(operation.id, operation.outputfeedref);
        //outputtblref (Optional)
        if(operation.outputtblref){
          this.addLineage(operation.id, operation.outputtblref);
        }
      }
      this.nodeIdMap[operation.id] = false;
      this.masterMap[operation.id] = operation;
    });
    console.log(
      this.nodeIdMap,
      this.systemsMap,
      this.feedsMap,
      this.tablesMap,
      this.viewsMap,
      this.operationsMap
    );
    console.log(this.nodeIdMap);
  }

  ///////////////////////////////GRAPH RELATED FUNCATIONALITY START////////////////////////////
  nodes = [
    /*{"id": 1, "name": "server 1"},
  {"id": 2, "name": "server 2"},
  {"id": 3, "name": "server 3"},
  {"id": 4, "name": "server 4"},
  {"id": 5, "name": "server 5"},
  {"id": 6, "name": "server 6"},
  {"id": 7, "name": "server 7"},
  {"id": 8, "name": "server 8"},
  {"id": 9, "name": "server 9"}*/
  ];
  links = [
    /*{source: 1, target: 2},
  {source: 1, target: 3},
  {source: 1, target: 4},
  {source: 2, target: 5},
  {source: 2, target: 6},
  {source: 3, target: 7},
  {source: 5, target: 8},
  {source: 6, target: 9}*/
  ];

  svg: any;
  svgcontainer: any;
  width: number;
  height: number;
  node: any;
  link: any;
  simulation: any;
  drag: any;
  zoom_handler = d3.zoom().scaleExtent([0.4, 2.5])
    .on("zoom",(e)=>{this.zoom_actions(e)})
    .filter((e)=>{
      if(e.type=='wheel'){
        if(e.altKey||e.shiftKey){
          return true;
        }
      }
      else{
        return true;
      }
      return false;
  });
    
  resetZoom(){
    this.svg.transition()
    .duration(750)
    .call(this.zoom_handler.transform, d3.zoomIdentity);
  }
  zoom_actions(e){
      this.svgcontainer.attr("transform", e.transform)
  }
  // zoomed(e,d) {
  //   this.svg.attr("transform", e.transform);
  // }
  ngAfterViewInit(){
    this.width = this.hostElement.nativeElement.offsetParent.offsetWidth;
    console.log(this.width)
    console.log(this.height)
    this.simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3
          .forceLink()
          .id(function(d) {
            return d["id"];
          })
          .distance(150)
          .strength(1)
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .on("tick", () => this.ticked());

      
  }
  ngAfterContentInit() {
    
    this.svg = d3.select("svg");
    this.zoom_handler(this.svg);
    this.svg
      //.call(d3.zoom()
      //.scaleExtent([0.1, 4])
      // .on("zoom", (e,d)=>this.zoomed(e,d))
      // )
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", (d)=>{console.log(d);return 20;})
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 13)
      .attr("markerHeight", 13)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "#999")
      .style("stroke", "none");
    
    this.svgcontainer = this.svg.append("g")

    
    //this.width = +this.svg.attr("width");
    this.height = +this.svg.attr("height");
    
    this.drag = d3
      .drag()
      .on("start", (e, d) => this.dragstarted(e, d))
      .on("drag", (e, d) => this.dragged(e, d))
      .on("end", (e, d) => this.dragended(e, d));
    //this.update();

    this.initApp();
  }

  update() {
    this.simulation.force("link").links(this.links);
    this.simulation.nodes(this.nodes);
    console.log("update");
    this.link = this.svgcontainer.selectAll(".link").data(this.links, function(d) {
      return d.target.id;
    });

    let linkEnter = this.link
      .enter()
      .append("line")
      .attr("class", "link")
      .attr("marker-end", "url(#arrowhead)");

    this.link.exit().remove()

    this.node = this.svgcontainer.selectAll(".node").data(this.nodes, function(d) {
      return d.id;
    });

    let nodeEnter = this.node
      .enter()
      .append("g")
      .attr("class", "node")
      .on("click", (e, d) => this.click(e, d))
      .on("contextmenu", (e, d)=>{
          e.preventDefault();
          this.removeNode(d.id,false)
        // react on right-clicking
      })
      .call(this.drag);
    this.node.exit().remove()
    this.node = nodeEnter.merge(this.node);

    this.link = linkEnter.merge(this.link);

    nodeEnter.append("circle").attr("r", (d, i) => {
      return this.getNodeSize(this.commons.getNodeTypeById(d.id));
    }).style("fill", (d, i) => {
      return this.getNodeColor(this.commons.getNodeTypeById(d.id));
    }).style("stroke","gray").style("stroke-width","1px").style("opacity","0.3");
    nodeEnter.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('font-size', (d, i) => {
      return ""+parseInt(""+this.getNodeSize(this.commons.getNodeTypeById(d.id))*1.5);
    })
    .text((d)=>{ return this.nodeIconMap[this.commons.getNodeTypeById(d.id)] });

    nodeEnter.append("title").text(function(d) {
      return 'Click for the details\nID: '+d.id;
    });

    nodeEnter
      .append("text")
      .attr("dy",(d)=> {
        return this.getNodeSize(this.commons.getNodeTypeById(d.id))+8;
      })
      .attr("dx", (d)=> {
        return this.getNodeSize(this.commons.getNodeTypeById(d.id))+4;
      })
      .text(function(d) {
        return d.name;
      })
      .style('font-weight','400');

    

    

    
    this.simulation.alpha(1).restart();
  }

  click(e, d) {
    /*let target = { id: this.index, name: "server " + this.index };
    this.nodes.push(target);
    this.links.push({ source: d, target: target });
    this.index++;
    this.update();*/
    this.setSelectedNodeId(d.id);
  }

  ticked() {
    console.log("ticked");
    if (this.link)
      this.link
        .attr("x1", function(d) {
          return d.source.x;
        })
        .attr("y1", function(d) {
          return d.source.y;
        })
        .attr("x2", function(d) {
          return d.target.x;
        })
        .attr("y2", function(d) {
          return d.target.y;
        });

    if (this.node)
      this.node.attr("transform", function(d) {
        return "translate(" + d.x + ", " + d.y + ")";
      });
  }

  dragstarted(e, d) {
    if (!e.active) this.simulation.alphaTarget(0.3).restart();
  }

  dragged(e, d) {
    console.log(arguments);
    d.fx = e.x;
    d.fy = e.y;
  }

  dragended(e, d) {
    console.log(arguments);
    if (!e.active) this.simulation.alphaTarget(0);
    d.fx = undefined;
    d.fy = undefined;
  }

  ///////////////////////////////GRAPH RELATED FUNCATIONALITY END////////////////////////////

  
}
