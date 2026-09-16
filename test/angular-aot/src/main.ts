// This fixture compiles the current source directly so Angular CLI diagnostics
// are not masked by a local symlink or package-resolution crash.
import '../../../src/accesserty-ui-kit.js';
import {Component,CUSTOM_ELEMENTS_SCHEMA,inject,Injectable,provideZonelessChangeDetection,signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {FormControl,ReactiveFormsModule,Validators} from '@angular/forms';
import {provideRouter,RouterLink,RouterOutlet} from '@angular/router';
import {TextAccessor,CheckedAccessor} from './accessors';
@Injectable({providedIn:'root'})
class Model {
  text=new FormControl('Initial',{nonNullable:true,validators:[Validators.required]});
  checked=new FormControl(false,{nonNullable:true});
  textValue=signal(this.text.value); checkedValue=signal(this.checked.value);
  textEvents=signal(0);checkEvents=signal(0);
  constructor(){this.text.valueChanges.subscribe(value=>{this.textValue.set(value);this.textEvents.update(v=>v+1);});this.checked.valueChanges.subscribe(value=>{this.checkedValue.set(value);this.checkEvents.update(v=>v+1);});}
}
@Component({standalone:true,imports:[ReactiveFormsModule,TextAccessor,CheckedAccessor],schemas:[CUSTOM_ELEMENTS_SCHEMA],template:`
<h1>Edit</h1><form (reset)="reset($event)">
<au-input name="review" label="Review" required [formControl]="model.text" [attr.aria-invalid]="model.text.invalid" aria-describedby="help"></au-input>
<p id="help">A review is required.</p>
<au-checkbox name="accept" label="Accept" [formControl]="model.checked"></au-checkbox>
<button type="reset">Reset</button></form>
<button id="write" (click)="write()">Write model</button><button id="disable" (click)="disable()">Toggle disabled</button>
<output id="value">{{model.textValue()}}</output><output id="checked">{{model.checkedValue()}}</output>
<output id="touched">{{model.text.touched}}</output><output id="valid">{{model.text.valid}}</output>
<output id="text-events">{{model.textEvents()}}</output><output id="check-events">{{model.checkEvents()}}</output>`})
class Edit {
  model=inject(Model);
  reset(event:Event){
    // Angular owns the form model. Prevent the native reset algorithm from
    // running after this handler and invoking the custom elements' native
    // formResetCallback with a pre-CVA (empty) baseline.
    event.preventDefault();
    this.model.text.reset();
    this.model.checked.reset();
    // Native form reset is not an Angular template event that zoneless
    // change detection can use as the display source. Keep this fixture's
    // diagnostic signals explicit while the custom elements perform their
    // own formResetCallback work.
    this.model.textValue.set(this.model.text.value);
    this.model.checkedValue.set(this.model.checked.value);
  }
  write(){this.model.text.setValue('From model');this.model.checked.setValue(true);}
  disable(){if(this.model.text.disabled){this.model.text.enable();this.model.checked.enable();}else{this.model.text.disable();this.model.checked.disable();}}
}
@Component({standalone:true,template:'<h1>Summary</h1><p id="summary">{{model.text.value}}</p>'})
class Summary{model=inject(Model);}
@Component({selector:'qa-app',standalone:true,imports:[RouterLink,RouterOutlet],template:'<nav aria-label="QA pages"><a routerLink="/edit">Edit</a> <a routerLink="/summary">Summary</a></nav><router-outlet />'})
class App{}
bootstrapApplication(App,{providers:[provideZonelessChangeDetection(),provideRouter([{path:'edit',component:Edit},{path:'summary',component:Summary},{path:'',redirectTo:'edit',pathMatch:'full'}])]}).catch(error=>{console.error(error);throw error;});
