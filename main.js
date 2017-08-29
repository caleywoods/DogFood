function getMeals() {
    let rows       = $( '.tableOddRow, .tableEvenRow' ).toArray();
    let re         = /[\n\r]+/;
    let mealEvents = [];

    rows.forEach((row) => {
      /* This splits row via the carriage return which gives us a 2 element
       * array in the form of:
       * ["Mon	08/28/17	", "1.15	0.00	1.45	0.00	0.00	0.00	6.00	2.60	3.40	6.20"]
       *
       * Each piece of data in each element is seperated by a tab character.
       */
      let rowArr = row.innerText.split( re );

      /* This breaks the first element into a 3 element array in the form of:
       * ["Mon", "08/28/17", ""]
       *
       * index 1 contains the date we need for moment
       */
      let mealDate = rowArr[0].split('	')[1];

      /* This breaks the second element into a 10 element array in the form of:
       * ["1.15", "0.00", "1.45", "0.00", "0.00", "0.00", "6.00", "2.60", "3.40", "6.20"]
       *
       * [0] is breakfast meal charge
       * [1] is breakfast a la carte (not available until High School)
       * [2] is lunch meal charge
       * [3] is lunch a la carte (not available until High School)
       * [4] is snack meal charge (not used past pre school?)
       * [5] is snack a la carte ( not used past pre school?)
       * [6] is deposits
       * [7] is total purchases (on the day)
       * [8] is net (don't care)
       * [9] is balance
       */
      let transactionDetails = rowArr[1].split('	'); //fuck your tab character.

      let breakfastCharge = Number( transactionDetails[0] );
      let lunchCharge     = Number( transactionDetails[2] );
      let deposit         = Number( transactionDetails[6] );
      let dailyBalance    = Number( transactionDetails[9] );

      if ( breakfastCharge > 0 ) {
        let breakfastEvent = {};
        breakfastEvent.title = "Breakfast - $" + breakfastCharge.toFixed( 2 );
        breakfastEvent.start = moment( mealDate );
        breakfastEvent.end   = moment( mealDate );

        breakfastEvent.start.hour( 7 );
        breakfastEvent.start.minutes( 30 );

        breakfastEvent.end.hour( 8 );
        breakfastEvent.end.minutes( 00 );

        mealEvents.push( breakfastEvent );
      }

      if ( lunchCharge > 0 ) {
          let lunchEvent = {};
          lunchEvent.title = "Lunch - $" + lunchCharge.toFixed( 2 );
          lunchEvent.start = moment( mealDate );
          lunchEvent.end   = moment( mealDate );

          lunchEvent.start.hour( 11 );
          lunchEvent.start.minutes( 30 );

          lunchEvent.end.hour( 12 );
          lunchEvent.end.minutes( 00 );

          mealEvents.push( lunchEvent );
      }

      if ( deposit > 0 ) {
          let depositEvent = {};

          depositEvent.allDay = true;
          depositEvent.color  = "green";
          depositEvent.end    = moment( mealDate );
          depositEvent.start  = moment( mealDate );
          depositEvent.title  = "Deposit - $" + deposit.toFixed( 2 );

          mealEvents.push( depositEvent );
      }

  });
    return mealEvents;
}

function createCalendarDiv() {
    console.log('create calendar div function');
    var calendarDiv  = document.createElement( 'DIV' );

    calendarDiv.id    = "calendar";
    calendarDiv.class = 'caley-cal';

    $( '#divChargesDeposits' ).append( calendarDiv );

    createFullCalendar();
}

function createFullCalendar() {
    console.log('create full calendar function');
    var meals = getMeals();

    // Hide the default table so our calendar renders at the top
    $( '#divChargesDeposits > table' ).hide();

    $( '#calendar' ).fullCalendar({
        theme: true,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        editable: false,
        events: meals,
        weekends:false
    });
}

// Execute createCalendarDiv() on DOM ready
$( document ).ready(() => {

  let intervalID = setInterval(() => {
    if ( window.location.hash === '#/mealService' ) {
      if ( $( '#divChargesDeposits > table' ).length > 0 ) {
        createCalendarDiv();
        clearInterval( intervalID );
      }
    }
  }, 500);
});
