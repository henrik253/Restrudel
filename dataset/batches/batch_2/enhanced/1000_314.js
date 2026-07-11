setcpm(104/4)

$: s("clavisynth sd").room(.8).attack(.3).clip(.8).gain(.3).release(1)

$: note("c4@2 a#3@2").s("triangle").lpf(4000).room(1).delay(.3056).gain(.3)

$: n("-2 0 3 ~ 0 2 4 0 2 4 -2 0 3 ~ 0 2 4").scale("c:minor").lpf(2175).room(1).delay(.5).gain(.25)
