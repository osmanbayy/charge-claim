import {
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateStationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  @Matches(/\S/, {
    message: 'name must contain at least one non-whitespace character',
  })
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/\S/, {
    message: 'district must contain at least one non-whitespace character',
  })
  district!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @Matches(/\S/, {
    message: 'address must contain at least one non-whitespace character',
  })
  address!: string;

  @IsNumber({
    maxDecimalPlaces: 6,
  })
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber({
    maxDecimalPlaces: 6,
  })
  @Min(-180)
  @Max(180)
  longitude!: number;
}
