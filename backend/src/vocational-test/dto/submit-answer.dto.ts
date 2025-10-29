// backend/src/vocational-test/dto/submit-answer.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsInt, Min, Max } from 'class-validator';

export class SubmitAnswerDto {
    @ApiProperty({ description: 'ID de la pregunta respondida', example: '635f...' })
    @IsMongoId() // Valida que sea un ID de MongoDB válido
    questionId: string;

    @ApiProperty({ description: 'Índice (0-3) de la opción seleccionada', example: 1 })
    @IsInt()
    @Min(0)
    @Max(3) // Asegura que el índice esté en el rango correcto
    selectedOptionIndex: number;
}