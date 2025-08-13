import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add success notification', () => {
    service.success('Success', 'Operation completed');
    
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].title).toBe('Success');
    expect(notifications[0].message).toBe('Operation completed');
  });

  it('should add error notification without auto-dismiss', () => {
    service.error('Error', 'Something went wrong');
    
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].title).toBe('Error');
    expect(notifications[0].duration).toBe(0);
  });

  it('should add warning notification', () => {
    service.warning('Warning', 'This is a warning');
    
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].title).toBe('Warning');
  });

  it('should add info notification', () => {
    service.info('Info', 'Information message');
    
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('info');
    expect(notifications[0].title).toBe('Info');
  });

  it('should remove notification after duration', fakeAsync(() => {
    service.show({
      type: 'info',
      title: 'Info',
      message: 'Test message',
      duration: 1000
    });

    expect(service.notifications().length).toBe(1);
    
    tick(1000);
    
    expect(service.notifications().length).toBe(0);
  }));

  it('should not auto-remove notifications with duration 0', fakeAsync(() => {
    service.show({
      type: 'error',
      title: 'Error',
      message: 'Persistent error',
      duration: 0
    });

    expect(service.notifications().length).toBe(1);
    
    tick(10000); // Wait 10 seconds
    
    expect(service.notifications().length).toBe(1); // Should still be there
  }));

  it('should manually remove notification', () => {
    service.info('Info', 'Test');
    const notifications = service.notifications();
    const id = notifications[0].id;

    expect(service.notifications().length).toBe(1);

    service.remove(id);
    expect(service.notifications().length).toBe(0);
  });

  it('should clear all notifications', () => {
    service.success('Success 1');
    service.warning('Warning 1');
    service.info('Info 1');

    expect(service.notifications().length).toBe(3);

    service.clear();
    expect(service.notifications().length).toBe(0);
  });

  it('should track hasNotifications correctly', () => {
    expect(service.hasNotifications()).toBe(false);

    service.info('Test');
    expect(service.hasNotifications()).toBe(true);

    service.clear();
    expect(service.hasNotifications()).toBe(false);
  });

  it('should generate unique IDs for notifications', () => {
    service.info('Test 1');
    service.info('Test 2');
    
    const notifications = service.notifications();
    expect(notifications.length).toBe(2);
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });

  it('should set correct timestamp', () => {
    const beforeTime = new Date();
    service.info('Test');
    const afterTime = new Date();
    
    const notification = service.notifications()[0];
    expect(notification.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(notification.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  it('should handle custom duration', fakeAsync(() => {
    service.show({
      type: 'info',
      title: 'Custom Duration',
      duration: 2000
    });

    expect(service.notifications().length).toBe(1);
    
    tick(1999);
    expect(service.notifications().length).toBe(1);
    
    tick(1);
    expect(service.notifications().length).toBe(0);
  }));

  it('should use default duration when not specified', fakeAsync(() => {
    service.show({
      type: 'info',
      title: 'Default Duration'
    });

    expect(service.notifications().length).toBe(1);
    
    tick(5000); // Default is 5000ms
    expect(service.notifications().length).toBe(0);
  }));
});
