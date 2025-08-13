import { TestBed } from '@angular/core/testing';
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

  it('should have initial empty state', () => {
    expect(service.notifications().length).toBe(0);
    expect(service.hasNotifications()).toBe(false);
  });

  it('should add success notification', () => {
    service.success('Success Title', 'Success message');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].title).toBe('Success Title');
    expect(notifications[0].message).toBe('Success message');
    expect(service.hasNotifications()).toBe(true);
  });

  it('should add error notification with no auto-dismiss', () => {
    service.error('Error Title', 'Error message');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].duration).toBe(0);
  });

  it('should add warning notification', () => {
    service.warning('Warning Title', 'Warning message');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].title).toBe('Warning Title');
  });

  it('should add info notification', () => {
    service.info('Info Title', 'Info message');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('info');
  });

  it('should generate unique IDs for notifications', () => {
    service.success('First notification');
    service.error('Second notification');

    const notifications = service.notifications();
    expect(notifications.length).toBe(2);
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });

  it('should include timestamp for notifications', () => {
    const beforeTime = new Date();
    service.info('Timestamped notification');
    const afterTime = new Date();

    const notification = service.notifications()[0];
    expect(notification.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(notification.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  it('should remove notification by ID', () => {
    service.success('First notification');
    service.error('Second notification');

    const notifications = service.notifications();
    expect(notifications.length).toBe(2);

    const firstId = notifications[0].id;
    service.remove(firstId);

    const remainingNotifications = service.notifications();
    expect(remainingNotifications.length).toBe(1);
    expect(remainingNotifications[0].id).not.toBe(firstId);
  });

  it('should clear all notifications', () => {
    service.success('First notification');
    service.error('Second notification');
    service.warning('Third notification');

    expect(service.notifications().length).toBe(3);

    service.clear();

    expect(service.notifications().length).toBe(0);
    expect(service.hasNotifications()).toBe(false);
  });

  it('should auto-dismiss notifications after duration', (done) => {
    service.show({
      type: 'info',
      title: 'Auto-dismiss test',
      duration: 100 // 100ms para test rápido
    });

    expect(service.notifications().length).toBe(1);

    setTimeout(() => {
      expect(service.notifications().length).toBe(0);
      done();
    }, 150);
  });

  it('should not auto-dismiss notifications with duration 0', (done) => {
    service.show({
      type: 'error',
      title: 'No auto-dismiss test',
      duration: 0
    });

    expect(service.notifications().length).toBe(1);

    setTimeout(() => {
      expect(service.notifications().length).toBe(1);
      done();
    }, 100);
  });

  it('should handle notifications with actions', () => {
    let actionCalled = false;
    
    service.show({
      type: 'info',
      title: 'Notification with action',
      action: {
        label: 'Click me',
        callback: () => { actionCalled = true; }
      }
    });

    const notification = service.notifications()[0];
    expect(notification.action).toBeTruthy();
    expect(notification.action!.label).toBe('Click me');

    // Simular click en la acción
    notification.action!.callback();
    expect(actionCalled).toBe(true);
  });

  it('should use default duration when not specified', () => {
    service.show({
      type: 'success',
      title: 'Default duration test'
    });

    const notification = service.notifications()[0];
    expect(notification.duration).toBe(5000); // Default 5 segundos
  });

  it('should maintain order of notifications', () => {
    service.success('First');
    service.error('Second');
    service.warning('Third');

    const notifications = service.notifications();
    expect(notifications[0].title).toBe('First');
    expect(notifications[1].title).toBe('Second');
    expect(notifications[2].title).toBe('Third');
  });

  it('should handle multiple notifications of same type', () => {
    service.success('Success 1');
    service.success('Success 2');
    service.success('Success 3');

    const notifications = service.notifications();
    expect(notifications.length).toBe(3);
    expect(notifications.every(n => n.type === 'success')).toBe(true);
  });
});
