
const TeamPage = () => {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Team Management</h1>
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title">Invite a Team Member</h2>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input type="email" placeholder="email@example.com" className="input input-bordered" />
                    </div>
                    <div className="form-control mt-4">
                        <button className="btn btn-primary">Send Invitation</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;
