#include<bits/stdc++.h>
using namespace std;
#define ll long long
#define nl '\n'

class SegmentTree {
    int n;
    vector<ll> tree, lazy;

public:
    SegmentTree(int size) {
        n = size;
        tree.assign(4 * n + 5, 0);
        lazy.assign(4 * n + 5, 0);
    }

    void build(int node, int start, int end, vector<ll>& arr) {
        if (start == end) {
            tree[node] = arr[start];
            return;
        }
        int mid = (start + end) / 2;
        build(node * 2, start, mid, arr);
        build(node * 2 + 1, mid + 1, end, arr);
        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }

    void push(int node, int start, int end) {
        if (lazy[node] != 0) {
            tree[node] += (end - start + 1) * lazy[node];
            if (start != end) {
                lazy[node * 2] += lazy[node];
                lazy[node * 2 + 1] += lazy[node];
            }
            lazy[node] = 0;
        }
    }

    void update(int node, int start, int end, int l, int r, ll val) {
        push(node, start, end);

        if (r < start || end < l) return;

        if (l <= start && end <= r) {
            lazy[node] += val;
            push(node, start, end);
            return;
        }

        int mid = (start + end) / 2;
        update(node * 2, start, mid, l, r, val);
        update(node * 2 + 1, mid + 1, end, l, r, val);

        tree[node] = tree[node * 2] + tree[node * 2 + 1];
    }

    ll query(int node, int start, int end, int l, int r) {
        push(node, start, end);

        if (r < start || end < l) return 0;

        if (l <= start && end <= r)
            return tree[node];

        int mid = (start + end) / 2;
        return query(node * 2, start, mid, l, r) +
               query(node * 2 + 1, mid + 1, end, l, r);
    }
};

void solve(){
    ll n, m;
    cin >> n >> m;

    vector<ll> arr(n + 1);
    for (int i = 1; i <= n; i++) cin >> arr[i];

    SegmentTree st(n);
    st.build(1, 1, n, arr);

    while (m--) {
        ll tp;
        cin >> tp;

        if (tp == 1) {
            ll id, val;
            cin >> id >> val;
            st.update(1, 1, n, id, id, val);
        }
        else {
            ll l, r;
            cin >> l >> r;
            cout << st.query(1, 1, n, l, r) << nl;
        }
    }
}

int main(){
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    solve();
}