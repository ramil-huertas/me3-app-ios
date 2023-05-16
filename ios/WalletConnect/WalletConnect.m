//
//  WalletConnect.m
//  Me3App
//
//  Created by Plusinfosys on 22/12/22.
//

#import <Foundation/Foundation.h>
#import "WalletConnect.h"
#import "Me3App-Swift.h"

@implementation WalletConnect {
  WalletConnectManager *walletConnectObj;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(createSession:(NSString *)url)
{
  if (walletConnectObj) {
    [walletConnectObj createSessionWithUrl:url];
  }
}

RCT_EXPORT_METHOD(clearAllData)
{
  
}

RCT_EXPORT_METHOD(approveSession:(NSString *)selectedWallet)
{
  if (walletConnectObj) {
    [walletConnectObj approveSessionWithSessionData:selectedWallet];
  }
}

RCT_EXPORT_METHOD(initIOS)
{
  walletConnectObj = [WalletConnectManager alloc];

//  [walletConnectObj clearAll];

  [walletConnectObj connectAll];

  walletConnectObj.blockSessionError = ^(NSError * _Nonnull error) {
      NSLog(@"%@",error);
  };

  walletConnectObj.blockSessionConnected = ^(BOOL status) {
      NSLog(@"%d",status);
  };

  walletConnectObj.blockSessionDisconnectd = ^{
    NSDictionary<NSString *,id> *request = [self->walletConnectObj removeSessionData];
    [self sendEvent:@"Disconnect" params:request];
  };

  walletConnectObj.blockSessionRequest = ^(NSDictionary<NSString *,id> * _Nonnull request) {
    [self sendEvent:@"CreateSession" params:request];
  };

  walletConnectObj.blockSessionSwitch = ^(NSDictionary<NSString *,id> * _Nonnull request) {
    [self sendEvent:@"ChainChangeFromDapp" params:request];
  };

  walletConnectObj.blockSessionSwitchSuccess = ^(NSDictionary<NSString *,id> * _Nonnull request) {
    [self sendEvent:@"ChainChangeSuccess" params:request];
  };

  walletConnectObj.blockSessionEthOnSign = ^(NSDictionary<NSString *,id> * _Nonnull request) {
    NSLog(@"%@",request);
    [self sendEvent:@"ETHSign" params:request];
  };

  walletConnectObj.blockSessionApproveSuccess = ^(NSDictionary<NSString *,id> * _Nonnull request) {
    [self sendEvent:@"ApproveSession" params:request];
  };

  walletConnectObj.blockSessionEthOnTransaction = ^(NSDictionary<NSString *,id> * _Nonnull request) {
    [self sendEvent:@"SendETHTransaction" params:request];
  };
}

RCT_EXPORT_METHOD(disconnectAllSessions)
{
  if (walletConnectObj) {
    [walletConnectObj disconnectAllSession];
  }
}

RCT_EXPORT_METHOD(updateSession:(NSString *)clickedItem)
{
  if (walletConnectObj) {
    [walletConnectObj switchChainWithSessionData:clickedItem isSwtichFromMobile:YES];
  }
}

RCT_EXPORT_METHOD(rejectSession)
{
  if (walletConnectObj) {
    [walletConnectObj rejectSession];
  }
}

RCT_EXPORT_METHOD(killSession:(NSString *)clickedItem)
{
  if (walletConnectObj) {
    [walletConnectObj disconnectSessionWithSessionData:clickedItem];
  }
}

RCT_EXPORT_METHOD(rejectRequest:(NSString *)id)
{
  if (walletConnectObj) {
    [walletConnectObj rejectRequestWith_id:[id longLongValue] _message:@"User canceled"];
  }
}

RCT_EXPORT_METHOD(rejectSendRequest:(NSString *)allData)
{
  if (walletConnectObj) {
    [walletConnectObj rejectSendRequestWithSessionData:allData];
  }
}

RCT_EXPORT_METHOD(approveSendRequest:(NSString *)allData)
{
  if (walletConnectObj) {
    [walletConnectObj approveSendRequestWithSessionData:allData];
  }
}

RCT_EXPORT_METHOD(switchChain:(NSString *)clickedItem)
{
  if (walletConnectObj) {
    [walletConnectObj switchChainWithSessionData:clickedItem isSwtichFromMobile:NO];
  }
}

RCT_EXPORT_METHOD(signRequest:(NSString *)id message:(NSString *)message)
{
  if (walletConnectObj) {
    [walletConnectObj approveRequestWith_id:[id longLongValue] _message:message];
    NSError * err;
    NSMutableDictionary *dict = [[NSMutableDictionary alloc]init];
    [dict setValue:@"Approve sign success" forKey:@"success"];
    NSData * jsonData = [NSJSONSerialization dataWithJSONObject:dict options:0 error:&err];
    NSString * request = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    [self sendEvent:@"ETHSignSuccess" params:request];
  }
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onSessionConnect",@"Disconnect",@"ApproveSession",@"CreateSession",@"ETHSign",@"ETHSignSuccess",@"ETHSignRejected",@"ChainChangeFromDapp",@"ChainChangeSuccess",@"UpdateChainSuccess",@"SignETHTransaction",@"SendETHTransaction"];
}

- (void)sendEvent:(NSString *)eventName params:(NSString *)params
{
//  pass eventName as name and params as body
    [self sendEventWithName:eventName body:params];
}


@end

