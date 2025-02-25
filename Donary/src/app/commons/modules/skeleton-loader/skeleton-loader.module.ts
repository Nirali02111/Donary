import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponentComponent } from './skeleton-loader-component/skeleton-loader-component.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ListCardSkeletonLoaderComponent } from './list-card-skeleton-loader/list-card-skeleton-loader.component';


@NgModule({
  declarations: [SkeletonLoaderComponentComponent, ListCardSkeletonLoaderComponent],
  imports: [
    CommonModule,
    NgxSkeletonLoaderModule,
  ],
  exports: [SkeletonLoaderComponentComponent,ListCardSkeletonLoaderComponent],
})
export class SkeletonLoaderModule { }
