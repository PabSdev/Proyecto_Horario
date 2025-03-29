import unittest
from app import agrupar_horarios_por_ciclo


class TestAgruparHorariosPorCiclo(unittest.TestCase):
    def test_mixed_professors(self):
        profesores = [
            {'Nombre': 'Pablo', 'Apellidos': 'Rodriguez', 'Ciclo': 'DAM', 'horario': {'lunes': ['15:30']}},
            {'Nombre': 'Carlos', 'Apellidos': 'Gómez', 'Ciclo': 'DAM', 'horario': {'lunes': ['15:30', '16:30']}},
            {'Nombre': 'Pedro', 'Apellidos': 'Sánchez', 'Ciclo': 'Sin ciclo', 'horario': {'jueves': ['17:30']}}
        ]
        expected = {
            'lunes': {
                'DAM': [
                    {'nombre': 'Pablo', 'apellidos': 'Rodriguez', 'horarios': ['15:30']},
                    {'nombre': 'Carlos', 'apellidos': 'Gómez', 'horarios': ['15:30', '16:30']}
                ]
            },
            'jueves': {
                'Sin ciclo': [
                    {'nombre': 'Pedro', 'apellidos': 'Sánchez', 'horarios': ['17:30']}
                ]
            }
        }
        result = agrupar_horarios_por_ciclo(profesores)
        self.assertEqual(result, expected)

    def test_all_with_cycles(self):
        profesores = [
            {'Nombre': 'Pablo', 'Apellidos': 'Rodriguez', 'Ciclo': 'DAM', 'horario': {'lunes': ['15:30']}},
            {'Nombre': 'Carlos', 'Apellidos': 'Gómez', 'Ciclo': 'DAM', 'horario': {'lunes': ['15:30', '16:30']}}
        ]
        expected = {
            'lunes': {
                'DAM': [
                    {'nombre': 'Pablo', 'apellidos': 'Rodriguez', 'horarios': ['15:30']},
                    {'nombre': 'Carlos', 'apellidos': 'Gómez', 'horarios': ['15:30', '16:30']}
                ]
            }
        }
        result = agrupar_horarios_por_ciclo(profesores)
        self.assertEqual(result, expected)

    def test_all_without_cycles(self):
        profesores = [
            {'Nombre': 'Pedro', 'Apellidos': 'Sánchez', 'Ciclo': 'Sin ciclo', 'horario': {'jueves': ['17:30']}},
            {'Nombre': 'Paula', 'Apellidos': 'Mendoza', 'Ciclo': 'Sin ciclo', 'horario': {'martes': ['18:30']}}
        ]
        expected = {
            'jueves': {
                'Sin ciclo': [
                    {'nombre': 'Pedro', 'apellidos': 'Sánchez', 'horarios': ['17:30']}
                ]
            },
            'martes': {
                'Sin ciclo': [
                    {'nombre': 'Paula', 'apellidos': 'Mendoza', 'horarios': ['18:30']}
                ]
            }
        }
        result = agrupar_horarios_por_ciclo(profesores)
        self.assertEqual(result, expected)

    def test_empty_professors(self):
        profesores = []
        expected = {}
        result = agrupar_horarios_por_ciclo(profesores)
        self.assertEqual(result, expected)

if __name__ == '__main__':
    unittest.main()