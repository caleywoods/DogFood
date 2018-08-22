function getMeals() {
    let rows       = $( '.tableOddRow, .tableEvenRow' ).toArray();
    let re         = /[\n\r]+/;
    let mealEvents = [];
    let latestBalance;

    rows.forEach((row, idx) => {
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
      let mealDate = moment(rowArr[0].split('	')[1]);

      /* This breaks the second element into a 12 element array in the form of:
       * ["1.15", "0.00", "1.45", "0.00", "0.00", "0.00", "6.00", "2.60", "3.40", "6.20"]
       *
       * [0] is breakfast meal charge
       * [1] is breakfast a la carte (not available until High School)
       * [2] is lunch meal charge
       * [3] is lunch a la carte (not available until High School)
       * [4] is snack meal charge (not used past pre school?)
       * [5] is snack a la carte ( not used past pre school?)
       * [6] is Total Daily Charge
       * [7] is deposits
       * [8] is net (don't care)
       * [9] is the word "Charge" (useless)
       * [10] is daily balance
       * [11] is an empty string
       */
      let transactionDetails = rowArr[1].split('	'); //fuck your tab character.

      let breakfastCharge = Number( transactionDetails[0] );
      let lunchCharge     = Number( transactionDetails[2] );
      let deposit         = Number( transactionDetails[7] );
      let dailyBalance    = Number( transactionDetails[10] );

      if ( breakfastCharge > 0 ) {
        let breakfastEvent = {};
        breakfastEvent.title = `Breakfast - $${breakfastCharge.toFixed( 2 )}`;
        breakfastEvent.allDay = true;
        breakfastEvent.start = mealDate;
        breakfastEvent.end   = mealDate;

        mealEvents.push( breakfastEvent );
      }

      if ( lunchCharge > 0 ) {
          let lunchEvent = {};
          lunchEvent.title = `Lunch - $${lunchCharge.toFixed( 2 )}`;
          lunchEvent.allDay = true;
          lunchEvent.start = mealDate;
          lunchEvent.end   = mealDate;

          mealEvents.push( lunchEvent );
      }

      if ( deposit > 0 ) {
          let depositEvent = {};

          depositEvent.allDay = true;
          depositEvent.color  = "green";
          depositEvent.end    = mealDate;
          depositEvent.start  = mealDate;
          depositEvent.title  = `Deposit - $${deposit.toFixed( 2 )}`;

          mealEvents.push( depositEvent );
      }

      if ( idx === 0 ) {
          latestBalance = dailyBalance;
      }
  });

    const today = moment();
    let balanceEvent = {};

    balanceEvent.allDay = true;
    balanceEvent.color = latestBalance < 5 ? 'red' : 'green';
    balanceEvent.end = today;
    balanceEvent.start = today;
    balanceEvent.title = `Balance - $${latestBalance.toFixed(2)}`;

    mealEvents.push(balanceEvent);

    return mealEvents;
}

function createCalendarDiv() {
    var calendarDiv  = document.createElement( 'DIV' );

    calendarDiv.id    = "calendar";
    calendarDiv.class = 'caley-cal';

    $( '#divChargesDeposits' ).append( calendarDiv );

    createFullCalendar();
}

function createFullCalendar() {
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


  /* This is our initial interval so that we can catch when the URL
   * fragment turns to #/mealService meaning the user is on the meals page
   */
  let intervalID = setInterval(() => {
    /* We've progressed from login to home to mealService, begin checking
     * the dom for the charges table. This table isn't available the instant
     * the hash matches so we have to keep checking the length. It will be 0
     * until the table is in the DOM.
     */
    if ( window.location.hash === '#/mealService' ) {
      /* We can now see the charges table, this is sort of like a second
       * DOM ready since SIS is an angular app. Now that we see the table el
       * we can do our magic.
       */
      if ( $( '#divChargesDeposits > table' ).length > 0 ) {
        createCalendarDiv();
        /* Stop this checking for the URL hash and looking for the charges
         * table so frequently.
         */
        clearInterval( intervalID );

        /* Create a new interval that runs every 3 seconds so that switching
         * between students re-draws the full calendar as it should.
         */
        let newInterval = setInterval(() => {
          if ( $( '#divChargesDeposits > table' ).length > 0 ) {
            createCalendarDiv();
          }
        }, 3000);
      }
    }
  }, 800);
});
