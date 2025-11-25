import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @ApiProperty({ description: 'User ID (UUID v4)' })
  @Prop({ type: String })
  _id: string;

  @ApiProperty({ description: 'Google OAuth ID' })
  @Prop({ required: true, unique: true })
  googleId: string;

  @ApiProperty({ description: 'Full name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Email address' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ description: 'Profile image URL' })
  @Prop()
  imageUrl?: string;

  @ApiProperty({ description: 'School/University name' })
  @Prop({ required: true })
  schoolName: string;

  @ApiProperty({ description: 'Age' })
  @Prop({ required: true, min: 16, max: 100 })
  age: number;

  @ApiProperty({ description: 'Major/Field of study' })
  @Prop({ required: true })
  major: string;

  @ApiProperty({ description: 'Faculty/Department' })
  @Prop({ required: true })
  faculty: string;

  @ApiProperty({ description: 'Interests and skills', type: [String] })
  @Prop({ type: [String], default: [] })
  interests: string[];

  @ApiProperty({ description: 'Bio/About me' })
  @Prop({ default: '' })
  bio: string;

  @ApiProperty({ description: 'User settings' })
  @Prop({
    type: Object,
    default: {
      aiSuggestionsEnabled: true,
      notifications: true,
      darkMode: false,
    },
  })
  settings: {
    aiSuggestionsEnabled: boolean;
    notifications: boolean;
    darkMode: boolean;
  };

  @ApiProperty({ description: 'Last seen timestamp' })
  @Prop({ default: Date.now })
  lastSeenAt: Date;

  @ApiProperty({ description: 'Refresh token for auth' })
  @Prop()
  refreshToken?: string;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
