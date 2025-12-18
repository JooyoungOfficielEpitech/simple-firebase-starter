//
//  RNPitchShifter.m
//  simplefirebasestarter
//
//  React Native Bridge for RNPitchShifter Swift module
//

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(RNPitchShifter, RCTEventEmitter)

RCT_EXTERN_METHOD(loadAudioFile:(NSString *)urlString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setPitch:(float)semitones)

RCT_EXTERN_METHOD(setRate:(float)rate)

RCT_EXTERN_METHOD(play:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pause)

RCT_EXTERN_METHOD(stop)

RCT_EXTERN_METHOD(seek:(double)timeSeconds
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCurrentTime:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isPlayerPlaying:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setABLoop:(BOOL)enabled
                  start:(double)start
                  end:(double)end)

@end
