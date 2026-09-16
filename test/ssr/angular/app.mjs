import '@angular/compiler';
import {Component,CUSTOM_ELEMENTS_SCHEMA,provideZonelessChangeDetection,signal} from '@angular/core';
import {provideClientHydration} from '@angular/platform-browser';
export class App {
  uploadName=signal('attachments');uploadLabel=signal('Attachments');removeLabel=signal('Remove');uploadDisabled=signal(false);uploadEvents=signal(0);uploadRemoved=signal(0);uploadModel=signal('');
  uploaded(event){this.uploadModel.set(event.target.value.map(f=>f.name).join(','));this.uploadEvents.update(v=>v+1);}
  crumbLabel=signal('Page trail');crumbs=signal([{text:'Home',url:'#crumb-home'},{text:'Guides',url:'#crumb-guides'},{text:'Current page'}]);
  stringify=JSON.stringify;
  translateCrumbs(){this.crumbLabel.set('頁面路徑');this.crumbs.set([{text:'首頁',url:'#crumb-home'},{text:'指南',url:'#crumb-guides'},{text:'目前頁面'}]);}
  shortenCrumbs(){this.crumbs.set([{text:'首頁',url:'#crumb-home'},{text:'指南'}]);}
  cardLabel=signal('Travel guide');cardActions=signal(0);
  increment=value=>value+1;
  carouselIndex=signal(0);carouselEvents=signal(0);carouselTitle=signal('Coast');
  carouselChanged(event){this.carouselIndex.set(event.detail.index);this.carouselEvents.update(v=>v+1);}
  accordionOpen=signal(false);accordionLabel=signal('FAQ');accordionEvents=signal(0);
  accordionChanged(event){this.accordionOpen.set(event.detail.open);this.accordionEvents.update(v=>v+1);}
  value=signal(1);name=signal('review');count=signal(0);text=signal('Initial');inputs=signal(0);
  notes=signal('Initial notes');notesEvents=signal(0);
  choice=signal(false);enabled=signal(false);toggleEvents=signal(0);
  delivery=signal('standard');radioEvents=signal(0);radioLabel=signal('Express');radioDisabled=signal(false);
  tabIndex=signal(1);tabEvents=signal(0);tabLabel=signal('Details');
  page=signal(2);pageSize=signal(10);pageEvents=signal(0);sizeEvents=signal(0);nextLabel=signal('Next');
  menuLabel=signal('Document actions');actionLabel=signal('Save');actionValue=signal('save');action=signal('');actionEvents=signal(0);
  treeData=signal([{id:'root',label:'Files',children:[{id:'alpha',label:'Alpha'},{id:'beta',label:'Beta',disabled:true},{id:'gamma',label:'Gamma'}]}]);treeChecks=signal('');treeEvents=signal(0);
  treeChanged(event){this.treeChecks.set(event.detail.checkedNodes.map(n=>n.id).join(','));this.treeEvents.update(v=>v+1);}
  translateTree(){this.treeData.set([{id:'root',label:'檔案',children:[{id:'alpha',label:'甲',lang:'zh-Hant'},{id:'beta',label:'Beta',disabled:true},{id:'gamma',label:'Gamma'}]}]);}
  selected(event){this.action.set(event.detail.value);this.actionEvents.update(v=>v+1);}
  paged(event){this.page.set(event.detail);this.pageEvents.update(v=>v+1);}
  sized(event){this.pageSize.set(event.detail);this.page.set(1);this.sizeEvents.update(v=>v+1);}
  tabbed(event){this.tabIndex.set(event.detail.index);this.tabEvents.update(v=>v+1);}
  delivered(event){this.delivery.set(event.detail.value);this.radioEvents.update(v=>v+1);}
  toggled(which,event){this[which].set(event.detail);this.toggleEvents.update(v=>v+1);}
  changed(event){this.value.set(event.detail.value);this.count.update(v=>v+1);}
  typed(event){this.text.set(event.target.value);this.inputs.update(v=>v+1);}
  noted(event){this.notes.set(event.target.value);this.notesEvents.update(v=>v+1);}
  update(){this.value.set(4);this.name.set('updated');this.text.set('Changed');this.notes.set('Changed notes');}
}
Component({selector:'test-app',standalone:true,schemas:[CUSTOM_ELEMENTS_SCHEMA],template:`
<main><h1>Angular component SSR</h1>
<form id="upload-form" enctype="multipart/form-data" (reset)="uploadModel.set('')"><fieldset id="upload-fieldset" [disabled]="uploadDisabled()"><legend>File attachments</legend><au-file-upload [attr.name]="uploadName()" [attr.label]="uploadLabel()" [attr.msg-remove-text]="removeLabel()" multiple required accept=".txt" (change)="uploaded($event)" (remove-file)="uploadRemoved.update(increment)"><button id="ssr-upload-trigger" type="button" slot="trigger">Choose attachments</button><span id="ssr-upload-hint" slot="hint">Text files only</span></au-file-upload></fieldset><button id="upload-reset" type="reset">Reset attachments</button></form>
<button id="upload-translate" (click)="uploadLabel.set('附件');removeLabel.set('刪除');uploadName.set('documents')">Translate attachments</button><button id="upload-disable" (click)="uploadDisabled.set(!uploadDisabled())">Toggle uploads</button><output id="upload-model">{{uploadModel()}}</output><output id="upload-events">{{uploadEvents()}},{{uploadRemoved()}}</output>
<span id="crumb-label">{{crumbLabel()}}</span><au-breadcrumbs aria-labelledby="crumb-label" [attr.items]="stringify(crumbs())"><span id="ssr-crumb-icon" slot="icon-1" aria-hidden="true">⌂</span></au-breadcrumbs>
<button id="crumb-translate" (click)="translateCrumbs()">Translate trail</button>
<button id="crumb-shorten" (click)="shortenCrumbs()">Shorten trail</button><h2 id="crumb-home" tabindex="-1">Home destination</h2><h2 id="crumb-guides" tabindex="-1">Guides destination</h2>
<form id="card-form"><au-card><div id="ssr-card-footer" slot="footer"><button type="button" id="card-action" (click)="cardActions.update(increment)">Save guide</button></div><div id="ssr-card-content" slot="content"><label for="card-input">Guide notes</label><input id="card-input" name="guide" value="Initial"></div><h2 id="ssr-card-heading" slot="heading">{{cardLabel()}}</h2></au-card></form>
<button id="card-translate" (click)="cardLabel.set('旅遊指南')">Translate card</button><output id="card-actions">{{cardActions()}}</output>
<au-carousel [current]="carouselIndex()" aria-label="Destinations" (slide-change)="carouselChanged($event)"><article id="ssr-slide-first" [attr.data-title]="carouselTitle()"><button id="carousel-first-action">Coast guide</button></article><article id="ssr-slide-second" data-title="City"><button>City guide</button></article></au-carousel>
<button id="carousel-update" (click)="carouselIndex.set(1)">City</button><button id="carousel-translate" (click)="carouselTitle.set('海岸')">Translate destination</button><output id="carousel-model">{{carouselIndex()}}</output><output id="carousel-events">{{carouselEvents()}}</output>
<au-accordion><au-accordion-item id="ssr-accordion-item" heading-level="2" [attr.open]="accordionOpen() ? '' : null" (au-toggle)="accordionChanged($event)"><span id="ssr-accordion-heading" slot="heading">{{accordionLabel()}}</span><div id="ssr-accordion-content" slot="content"><button id="accordion-content-button">Read answer</button></div></au-accordion-item></au-accordion>
<button id="accordion-update" (click)="accordionOpen.set(true)">Open FAQ</button><button id="accordion-translate" (click)="accordionLabel.set('常見問題')">Translate FAQ</button><output id="accordion-model">{{accordionOpen()}}</output><output id="accordion-events">{{accordionEvents()}}</output>
<span id="tree-label">Project files</span><au-tree [data]="treeData()" show-checkbox aria-labelledby="tree-label" (change)="treeChanged($event)"></au-tree>
<button id="tree-translate" (click)="translateTree()">Translate tree</button><output id="tree-model">{{treeChecks()}}</output><output id="tree-events">{{treeEvents()}}</output>
<au-dropdown [attr.data-text-trigger]="menuLabel()" (selected)="selected($event)"><au-dropdown-item id="ssr-action-edit" value="edit">Edit</au-dropdown-item><au-dropdown-item id="ssr-action-save" [attr.value]="actionValue()">{{actionLabel()}}</au-dropdown-item></au-dropdown>
<button id="action-translate" (click)="menuLabel.set('文件操作');actionLabel.set('儲存');actionValue.set('save-copy')">Translate actions</button><output id="action-model">{{action()}}</output><output id="action-events">{{actionEvents()}}</output>
<au-pagination data-total="100" [attr.data-current-page]="page()" [attr.data-page-size]="pageSize()" [attr.data-text-next]="nextLabel()" (page-change)="paged($event)" (page-size-change)="sized($event)"></au-pagination>
<button id="page-update" (click)="page.set(4)">Page four</button><button id="page-label-update" (click)="nextLabel.set('下一頁')">Translate navigation</button><output id="page-model">{{page()}},{{pageSize()}}</output><output id="page-events">{{pageEvents()}},{{sizeEvents()}}</output>
<span id="sections-label">Review sections</span><au-tabs [attr.selected-index]="tabIndex()" aria-labelledby="sections-label" (tab-change)="tabbed($event)"><section id="ssr-panel-first" class="au-tab-panel" slot="panel" label="Overview">Overview content</section><section id="ssr-panel-second" class="au-tab-panel" slot="panel" [attr.label]="tabLabel()" [attr.label-lang]="tabLabel()==='Details'?'en':'zh-Hant'">Details content</section></au-tabs>
<button id="tab-label-update" (click)="tabLabel.set('細節')">Translate tab</button><button id="tab-update" (click)="tabIndex.set(1)">Details tab</button><output id="tab-events">{{tabEvents()}}</output><output id="tab-model">{{tabIndex()}}</output>
<form id="controls-form">
<au-rating [attr.name]="name()" [attr.value]="value()" aria-label="Review rating" labels="Bad,Fair,Good,Great,Excellent" (change)="changed($event)"></au-rating>
<span id="text-label">Review text</span><span id="text-help">Enter a review</span><au-input name="text" [attr.value]="text()" aria-labelledby="text-label" aria-describedby="text-help" (input)="typed($event)"></au-input>
<span id="notes-label">Review notes</span><span id="notes-help">Enter detailed notes</span><au-textarea name="notes" [attr.value]="notes()" aria-labelledby="notes-label" aria-describedby="notes-help" (input)="noted($event)"></au-textarea>
<span id="choice-label">Receive news</span><span id="toggle-help">Optional preference</span><au-checkbox name="choice" [attr.checked]="choice() ? '' : null" aria-labelledby="choice-label" aria-describedby="toggle-help" (change)="toggled('choice',$event)"></au-checkbox>
<span id="enabled-label">Enable notifications</span><au-switch name="enabled" [attr.checked]="enabled() ? '' : null" aria-labelledby="enabled-label" aria-describedby="toggle-help" (change)="toggled('enabled',$event)"></au-switch>
<span id="delivery-label">Delivery</span><span id="delivery-help">Choose one delivery option</span><au-radio-group name="delivery" [attr.value]="delivery()" [attr.disabled]="radioDisabled() ? '' : null" aria-labelledby="delivery-label" aria-describedby="delivery-help" (change)="delivered($event)"><au-radio value="standard" checked>Standard</au-radio><au-radio value="express" [attr.label]="radioLabel()">Express</au-radio><au-radio value="unavailable" disabled>Unavailable</au-radio></au-radio-group>
</form><button id="radio-update" (click)="delivery.set('express')">Express delivery</button><button id="radio-label-update" (click)="radioLabel.set('快遞')">Translate option</button><button id="radio-disable" (click)="radioDisabled.set(!radioDisabled())">Toggle availability</button><output id="radio-events">{{radioEvents()}}</output><output id="radio-model">{{delivery()}}</output>
<button id="toggle-update" (click)="choice.set(true);enabled.set(true)">Enable both</button><output id="toggle-events">{{toggleEvents()}}</output><output id="toggle-model">{{choice()}},{{enabled()}}</output>
<button id="update" (click)="update()">Update values</button><output id="events">{{count()}}</output><output id="input-events">{{inputs()}}</output><output id="notes-events">{{notesEvents()}}</output><output id="notes-model">{{notes()}}</output><output id="ready">true</output></main>`})(App);
export const providers=[provideZonelessChangeDetection(),provideClientHydration()];
