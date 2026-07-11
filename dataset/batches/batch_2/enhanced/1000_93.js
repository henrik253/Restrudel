setcpm(100/4)
$: s("mt ~ lt ~").room(.2).gain(.8)
$: s("bd ~ ~ ~").gain(.85)
$: n("2 1@3 0@3 2@5.5").slow(2).scale("d:minor").s("sawtooth").lpf(1200).gain(.35).release(.15)
