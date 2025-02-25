import { Component, Input } from '@angular/core';
import { SkeletonLoaderModule } from '../skeleton-loader.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-circle-skeleton-loader',
  standalone: true,
  imports: [SkeletonLoaderModule,NgxSkeletonLoaderModule,CommonModule],
  templateUrl: './circle-skeleton-loader.component.html',
  styleUrl: './circle-skeleton-loader.component.scss'
})
export class CircleSkeletonLoaderComponent {
  @Input() isLoading = true;
  @Input() count=1;
  @Input() theme: { [k: string]: string } = {
    width: '50px',
    height: '50px',
  };
}
