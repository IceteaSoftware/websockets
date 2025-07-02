import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'
import * as ethers from 'ethers'

export function IsWalletAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWalletAddress',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return ethers.isAddress(value)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} invalid`
        },
      },
    })
  }
}
