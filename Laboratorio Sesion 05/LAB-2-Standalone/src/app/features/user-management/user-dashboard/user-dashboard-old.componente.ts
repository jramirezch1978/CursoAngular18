// CÓDIGO LEGACY - Antes de migración
import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { MetricsService } from '../services/metrics.service';
import { ChartService } from '../services/chart.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  users: any[] = [];
  metrics: any = {};
  chartData: any = {};
  loading = false;
  selectedPeriod = 'month';

  constructor(
    private userService: UserService,
    private metricsService: MetricsService,
    private chartService: ChartService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.userService.getUsers().subscribe(
        users => {
            this.users = users;
            this.updateMetrics();
            this.loading = false;
        }
    );
  }
  

  updateMetrics() {
    this.metrics = this.metricsService.calculateMetrics(this.users);
    this.chartData = this.chartService.prepareChartData(this.metrics, this.selectedPeriod);
  }
}
