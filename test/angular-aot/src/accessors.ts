import {Directive,ElementRef,forwardRef,inject} from '@angular/core';
import {ControlValueAccessor,NG_VALUE_ACCESSOR} from '@angular/forms';

// Consumer-owned examples, not adapters shipped by the UI Kit package.
@Directive({selector:'au-input[formControl]',standalone:true,
  providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>TextAccessor),multi:true}],
  host:{'(input)':'edited()','(focusout)':'touched()'}})
export class TextAccessor implements ControlValueAccessor {
  private el=inject(ElementRef).nativeElement as HTMLElement & {value:string};
  private change:(value:string)=>void=()=>{};
  touched:()=>void=()=>{};
  writeValue(value:string|null):void{this.el.value=value??'';}
  registerOnChange(fn:(value:string)=>void):void{this.change=fn;}
  registerOnTouched(fn:()=>void):void{this.touched=fn;}
  setDisabledState(value:boolean):void{this.el.toggleAttribute('disabled',value);}
  edited():void{this.change(this.el.value);}
}
@Directive({selector:'au-checkbox[formControl]',standalone:true,
  providers:[{provide:NG_VALUE_ACCESSOR,useExisting:forwardRef(()=>CheckedAccessor),multi:true}],
  host:{'(change)':'edited()','(focusout)':'touched()'}})
export class CheckedAccessor implements ControlValueAccessor {
  private el=inject(ElementRef).nativeElement as HTMLElement & {checked:boolean};
  private change:(value:boolean)=>void=()=>{};
  touched:()=>void=()=>{};
  writeValue(value:boolean|null):void{this.el.checked=value===true;}
  registerOnChange(fn:(value:boolean)=>void):void{this.change=fn;}
  registerOnTouched(fn:()=>void):void{this.touched=fn;}
  setDisabledState(value:boolean):void{this.el.toggleAttribute('disabled',value);}
  edited():void{this.change(this.el.checked);}
}
