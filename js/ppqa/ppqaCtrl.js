serviceApp.controller('PPQACtrl', function($scope, SqlConFactory, CreateRequest, EmailService, xml2json) {

  var ppqaQuery = 'SELECT * FROM PCOSQL05.aos_active.dbo.Jobs j INNER JOIN PCOSQL05.aos_active.dbo.Contract_PPQA p on p.Contract_ID= j.Contract_ID INNER JOIN Employer.Domain.Job d on d.JobID = Job_Guid WHERE  ProductCode is null'
  var sqlConnectionStringPCOSQL10 = '';

  $scope.PPQAResults = SqlConFactory.CallSql(ppqaQuery, sqlConnectionStringPCOSQL10);
  if ($scope.PPQAResults > 0) {
    //TODO send e-mail!!
    CreateRequest.ServiceNowRequest($scope.PPQAResults, 'bla');
    //to, subject, msg, file
    var to = 'nathan.rogers.d@gmail.com';
    var subject = 'Missing PPQA Codes';
    var msg = 'Ad hoc request needing your approval, ' + $scope.PPQAResults + ' records missing PPQA codes.'
    EmailService.SendEmail(to, subject, msg);
  }

});
