import { Test, TestingModule } from '@nestjs/testing';
import { LocalEmailService } from './local-email.service';
import * as nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('LocalEmailService', () => {
  let service: LocalEmailService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    // Create a mock for the sendMail method
    mockSendMail = jest.fn().mockResolvedValue({
      accepted: ['test@example.com'],
      rejected: [],
      response: '250 OK',
    });

    // Mock the createTransport function to return an object with a sendMail method
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalEmailService],
    }).compile();

    service = module.get<LocalEmailService>(LocalEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a nodemailer transport with localhost configuration', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 1025,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  });

  it('should send an email with provided options', async () => {
    // Arrange
    const emailOptions = {
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
    };

    // Act
    await service.send(emailOptions);

    // Assert
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'noreply@orderbuddy.test',
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
    });
  });

  it('should use custom from address when provided', async () => {
    // Arrange
    const emailOptions = {
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
      from: 'custom@orderbuddy.test',
    };

    // Act
    await service.send(emailOptions);

    // Assert
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'custom@orderbuddy.test',
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
    });
  });

  it('should handle errors when sending emails', async () => {
    // Arrange
    mockSendMail.mockRejectedValueOnce(new Error('Failed to send email'));
    const emailOptions = {
      to: 'user@example.com',
      subject: 'Test Subject',
      html: '<p>Test content</p>',
    };

    // Act & Assert
    await expect(service.send(emailOptions)).rejects.toThrow('Failed to send email');
  });
});
