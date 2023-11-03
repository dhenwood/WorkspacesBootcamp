import xapi from 'xapi';

// End Room Booking Macro
// Contributers:
// - Darren Henwood (dhenwood@cisco.com)

var bookingId;
var meetingId;


xapi.Event.Bookings.Start.on(async booking_info => {
        bookingId = booking_info.Id;
        console.log("Booking " + bookingId + " detected");
        xapi.Status.Bookings.Availability.Status.get().then(availability => {
            if (availability === 'BookedUntil') {
                xapi.Command.Bookings.Get({
                    Id: bookingId
                }).then(booking => {
                    meetingId = booking.Booking.MeetingId;
                    console.log("MeetingId: " + meetingId)
                })
            }
        })
})

function declineMeeting(){
  xapi.Command.Bookings.Get({
    Id: bookingId
    }).then(book => {
      xapi.Command.Bookings.Respond({
        Type: "Decline",
        MeetingId: meetingId
      });
  });
}

xapi.event.on('UserInterface Extensions Widget Action', (event) => {
  if (event.WidgetId == "endMeetingNowWidget"){
    if (event.Type == 'released' && event.Value == 'yes'){
      console.log("Yes")
      declineMeeting();
    }else if (event.Type == 'released' && event.Value == 'no'){
      console.log("No")
    }
    xapi.command("UserInterface Extensions Panel Close")
  }
});


function createPanel(){
  const panel = `
  <Extensions>
  <Version>1.11</Version>
  <Panel>
    <Order>2</Order>
    <PanelId>panel_1</PanelId>
    <Location>HomeScreen</Location>
    <Icon>Custom</Icon>
    <CustomIcon>
      <Content>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</Content>
      <Id>6da8f9f0616a4cc1237178344343d1d3c9e9cf62ab1a18a1feb5134464153f4d</Id>
    </CustomIcon>
    <Name>End Room Booking</Name>
    <ActivityType>Custom</ActivityType>
    <Page>
      <Name>End Meeting Now</Name>
      <Row>
        <Name>Row</Name>
        <Widget>
          <WidgetId>endMeetingNowWidget</WidgetId>
          <Type>GroupButton</Type>
          <Options>size=4</Options>
          <ValueSpace>
            <Value>
              <Key>yes</Key>
              <Name>Yes</Name>
            </Value>
            <Value>
              <Key>no</Key>
              <Name>Cancel</Name>
            </Value>
          </ValueSpace>
        </Widget>
      </Row>
      <Options>hideRowNames=1</Options>
    </Page>
  </Panel>
</Extensions>
`

xapi.Command.UserInterface.Extensions.Panel.Save({
    PanelId: 'webwidget'
  }, panel)
}

createPanel(); 
