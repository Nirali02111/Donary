import { Component, Input } from '@angular/core';
import { SkeletonLoaderModule } from '../skeleton-loader.module';

@Component({
  selector: 'app-edit-skeleton-loader',
  standalone: true,
  imports: [SkeletonLoaderModule],
  templateUrl: './edit-skeleton-loader.component.html',
  styleUrl: './edit-skeleton-loader.component.scss'
})
export class EditSkeletonLoaderComponent {
  @Input()isLoader = true;
  @Input() theme1: { [k: string]: string } = { width: '150px', height: '35px' }
  @Input() theme2: { [k: string]: string } = { width: '290px', height: '35px' }
}
