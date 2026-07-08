setcpm(120/4)

$: s("saw hh:8 sd").lpf(3000).room(.3).gain(.3779).release(.08)

$: s("clavisynth rd").lpf("<[10 10 100]>").room(2).gain(.15)

$: note("a5 c6").s("sawtooth")
