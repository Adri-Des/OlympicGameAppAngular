import { Component, OnDestroy, OnInit } from '@angular/core';
import { count, Observable, of, Subscription } from 'rxjs';
import { OlympicCountry } from 'src/app/core/models/Olympic';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  /**
   * Observable that holds the list of Olympic countries.
   */
  public olympics$: Observable<OlympicCountry[]> = of([]);

  /**
   * Subscription to handle the observable data stream.
   */
  private homeSubscription!: Subscription;

  /**
   * Constructor that injects the required services: OlympicService for data handling
   * and Router for navigation.
   * @param olympicService Service used to fetch Olympic data.
   * @param router Router to handle navigation.
   */
  constructor(private olympicService: OlympicService, private router: Router) {}

  /**
   * Angular method that is called after the component's view has been initialized.
   * It subscribes to the Olympic data and creates the chart using the retrieved data.
   */
  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();
    this.homeSubscription = this.olympics$.subscribe(
      (countries: OlympicCountry[]) => {
        this.createOlympicChart(countries);
      }
    );
  }

  /**
   * Angular method that is called when the component is destroyed.
   * It unsubscribes from the observable.
   */
  ngOnDestroy(): void {
    if (this.homeSubscription) {
      this.homeSubscription.unsubscribe();
    }

    const tooltipsCstm = document.getElementById('chartjs-tooltip');
    if (tooltipsCstm) {
      tooltipsCstm.style.opacity = '0'; // Hide tooltip
      setTimeout(() => {
        tooltipsCstm.remove(); // Remove tooltip element
      }, 300); // Delay to allow fade out effect
    }
  }

  /**
   * Creates a pie chart that visualizes the number of medals per country.
   * It uses the Chart.js library along with the DataLabels plugin.
   * @param countries Array of Olympic countries to display in the chart.
   */
  createOlympicChart(countries: OlympicCountry[]): void {
    // Get the names of the countries.
    const { countryNames } = this.olympicService.getCountriesNames(countries);

    //Retrieve the total medals per country.
    const chartData = countries.map((country) => {
      const { medals } = this.olympicService.getMedalsPerCountry(
        country.participations
      );
      const { totalMedals } = this.olympicService.getTotalMedals(medals);

      return {
        totalMedals,
      };
    });

    // Extract the total medals in an array (it will be injected in the chart)
    const total = chartData.map((data) => data.totalMedals);

    // Display the number of Olympic Games each country has participated in.
    countries.forEach((country) => {
      const numberJo = this.olympicService.getNumberOfJo(
        country.participations
      );

      const numberOfJo = document.getElementById('numberOfJo');
      if (numberOfJo) {
        numberOfJo!.innerHTML = `Number of JOs <br><strong>${numberJo}<\strong>`;
      }
    });

    // Display the total number of countries.
    const numberOfCountries = document.getElementById('numberOfCountries');
    if (numberOfCountries) {
      numberOfCountries.innerHTML = `Number of countries <br><strong>${countries.length}<\strong>`;
    }

    // Get the chart's canvas element.
    const chart = document.getElementById(
      'OlympicCountryChart'
    ) as HTMLCanvasElement;

    // Destroy any existing chart on the canvas before creating a new one.
    if (Chart.getChart(chart)) {
      Chart.getChart(chart)?.destroy();
    }

    // Define colors for each country.
    const countryColors = countryNames.map((country) => {
      switch (country) {
        case 'Italy':
          return ' #895044';
        case 'United States':
          return ' #618dcd ';
        case 'Germany':
          return ' #78191f ';
        case 'France':
          return ' #9c80b6 ';
        case 'Spain':
          return ' #9bc3dc ';
        default:
          return ' #f2f3f4 ';
      }
    });

    // Create a new pie chart.
    new Chart(chart, {
      plugins: [ChartDataLabels],
      type: 'pie',
      data: {
        labels: countryNames,
        datasets: [
          {
            //label: 'medals',
            data: total,
            backgroundColor: countryColors,
          },
        ],
      },
      options: {
        responsive: true,

        maintainAspectRatio: false,
        plugins: {
          /*title: {
            display: true,
            text: 'Medals per Country',
            font: {
              size: 50,
            },
            color: ' #3e8c91',
          },*/

          tooltip: {
            //backgroundColor: '#3e8c91',
            //usePointStyle: false,

            enabled: false, // Disable the default tooltip to use a custom one
            external: function (context) {
              // Tooltip Element
              let tooltipsCstm = document.getElementById('chartjs-tooltip');

              // tooltip style
              if (!tooltipsCstm) {
                tooltipsCstm = document.createElement('div');
                tooltipsCstm.id = 'chartjs-tooltip';
                tooltipsCstm.style.background = '#3e8c91';
                tooltipsCstm.style.borderRadius = '3px';
                tooltipsCstm.style.color = '#fff';
                tooltipsCstm.style.pointerEvents = 'none';
                tooltipsCstm.style.position = 'absolute';
                tooltipsCstm.style.transform = 'translate(-20%, -20%)';
                tooltipsCstm.style.padding = '10px';

                document.body.appendChild(tooltipsCstm);
              }

              // Hide if no tooltip
              const tooltipModel = context.tooltip;
              if (tooltipModel.opacity === 0) {
                tooltipsCstm.style.opacity = '0';
                return;
              }

              // Set the text
              if (tooltipModel.body) {
                const medalEmoji = '🏅';
                const title = tooltipModel.title[0] || '';
                const value = tooltipModel.body[0].lines[0] || '';

                let innerHtml = `<div><strong> ${title}</strong></div>`;
                innerHtml += `<div>${medalEmoji} ${value}</div>`;

                tooltipsCstm.innerHTML = innerHtml;

                // Create the tip to the tooltip
                const tip = document.createElement('div');
                tip.id = 'chartjs-tooltip-tip';

                tip.style.borderLeft = '10px solid transparent';
                tip.style.borderRight = '10px solid transparent';
                tip.style.borderTop = '6px solid #3e8c91';
                tip.style.position = 'absolute';
                tip.style.left = '38%';
                tip.style.bottom = '-6px';
                tooltipsCstm.appendChild(tip);
              }

              // Positioning

              /*const position = context.chart.canvas.getBoundingClientRect();
              tooltipsCstm.style.opacity = '1';
              tooltipsCstm.style.left =
                position.left + window.scrollX + tooltipModel.caretX + 'px';
              tooltipsCstm.style.top =
                position.top + window.scrollY + tooltipModel.caretY + 'px';*/
              const position = context.chart.canvas.getBoundingClientRect();

              //const mouseX = tooltipModel.dataPoints[0].element.x;
              //const mouseY = tooltipModel.dataPoints[0].element.y;
              const mouseX = tooltipModel.caretX;
              const mouseY = tooltipModel.caretY;
              tooltipsCstm.style.opacity = '1';
              tooltipsCstm.style.left = position.left + mouseX + 'px';
              tooltipsCstm.style.top = position.top + mouseY + 'px';

              console.log(mouseX, mouseY);
            },
          },

          datalabels: {
            anchor: 'end',

            align: 'end',

            formatter: function (value, context) {
              return context.chart.data.labels![context.dataIndex];
            },
            color: (context) => context.dataset.backgroundColor as string,

            offset: function (context) {
              return context.chart.width < 950 ? 0 : 10;
            },

            clamp: true,
            clip: false,
            //textAlign: 'start',
            display: true,
          },
        },

        //when a click is perform on a section of the chart, retrieve the corresponding country
        onClick: (event, element) => {
          if (element.length > 0) {
            const Point = element[0];
            const countryselect = countryNames[Point.index];

            // Navigate to the details page for the selected country.
            this.router.navigate(['details', countryselect]);
          }
        },
      },
    });
  }
}
