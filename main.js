function getMeals() {
    var mealsTable  = $( '#ctl00_ContentPlaceHolder1_dgLunch > tbody > tr' ),
        dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    // Remove the first element which is the table header
    mealsTable = mealsTable.slice( 1,mealsTable.length );
    mealEvents = [];

    mealsTable.each( function(idx, meal) {
        /* Turn each row into an indexable array element
         * [0] is the school (BDES = Elementary, BDHS = High School)
         * [1] is the date
         * [2] is breakfast charge
         * [3] is lunch charge
         * [4] is snack milk charge
         * [5] is deposit
         */
        var detailArray     = meal.innerText.split('    '),
            mealDate        = new Date( detailArray[1] ),
            breakfastCharge = Number( detailArray[2] ),
            lunchCharge     = Number( detailArray[3] ),
            deposit         = Number( detailArray[5] ),
            mealEvent       = {};

        if ( breakfastCharge > 0 ) {
            mealEvent.title = "Breakfast - $" + breakfastCharge.toFixed( 2 );
            mealEvent.start = moment( mealDate );
            mealEvent.end   = moment( mealDate );

            mealEvent.start.hour( 7 );
            mealEvent.start.minutes( 30 );

            mealEvent.end.hour( 8 );
            mealEvent.end.minutes( 00 );

            mealEvents.push( mealEvent );
        }

        if ( lunchCharge > 0 ) {
            mealEvent.title = "Lunch - $" + lunchCharge.toFixed( 2 );
            mealEvent.start = moment( mealDate );
            mealEvent.end   = moment( mealDate );

            mealEvent.start.hour( 11 );
            mealEvent.start.minutes( 30 );

            mealEvent.end.hour( 12 );
            mealEvent.end.minutes( 00 );

            mealEvents.push( mealEvent );
        }

        if ( deposit > 0 ) {
            depositEvent = {};

            depositEvent.allDay = true;
            depositEvent.color  = "green";
            depositEvent.end    = moment( mealDate );
            depositEvent.start  = moment( mealDate );
            depositEvent.title  = "Deposit - $" + deposit.toFixed( 2 );

            mealEvents.push( depositEvent );            
        }
    });

    // Create event for "today" showing current balance
    var summary      = $( '#ctl00_ContentPlaceHolder1_lblLunchSummary' )[0].innerText,
        summaryArr   = summary.split('       '),
        balance      = summaryArr[2].split(':')[1].trim(),
        balanceAmt   = Number( balance.replace('$', '') ).toFixed( 2 ),
        balanceEvent = {};

    balanceEvent.allDay = true; 
    balanceEvent.color  = '#0000ff';
    balanceEvent.start  = moment().format(); 
    balanceEvent.title  = "Balance - " + balance;

    if ( balanceAmt < 5 ) {
        balanceEvent.color = "red";
    }

    mealEvents.push( balanceEvent );

    return mealEvents;
}

function createCalendarDiv() {
    var calendarDiv  = document.createElement( 'DIV' );

    calendarDiv.id  = "calendar";

    $( '#ctl00_updatePanel1' ).append( calendarDiv );

    createFullCalendar();
}

function createFullCalendar() {
    var meals = getMeals();

    // Hide the default grid so our calendar renders at the top
    $( '#ctl00_dvContent' ).hide();

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
$( document ).ready(function() { createCalendarDiv(); });