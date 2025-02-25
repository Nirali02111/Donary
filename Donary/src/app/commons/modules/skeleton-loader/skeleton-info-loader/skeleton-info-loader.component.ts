import { Component, Input } from '@angular/core';
import { SkeletonLoaderComponentComponent } from '../skeleton-loader-component/skeleton-loader-component.component';
import { SkeletonLoaderModule } from '../skeleton-loader.module';

@Component({
  selector: 'app-skeleton-info-loader',
  standalone: true,
  imports: [SkeletonLoaderModule],
  templateUrl: './skeleton-info-loader.component.html',
  styleUrl: './skeleton-info-loader.component.scss'
})
export class SkeletonInfoLoaderComponent {
  @Input()isLoader = true;
}
