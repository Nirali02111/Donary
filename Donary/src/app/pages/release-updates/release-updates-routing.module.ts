import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UpdatesViewComponent } from './updates-view/updates-view.component';

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: UpdatesViewComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReleaseUpdatesRoutingModule { }
