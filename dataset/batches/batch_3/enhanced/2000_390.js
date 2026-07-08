setcpm(100/4)

$: s("psaltery_pluck gm_cello:1").gain(.8)

$: n("-3 -1 1 -4").gain(0.4)

$: n("-2 0 3 ~ 0 2 4 0 2 4 -2 0 3 ~ -4 -1 1 -4 -1 -1 -5 -3 -3 -3 -1 -1 -4 -2 b -2 b -5").clip(.9).lpf(700).velocity(.75).pan(.4).gain(0.5)
