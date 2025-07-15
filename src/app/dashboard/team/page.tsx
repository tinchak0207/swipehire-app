const TeamPage = () => {
  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Team Management</h1>
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Invite a Team Member</h2>
          <div className="form-control">
            <label className="label" htmlFor="email-input">
              <span className="label-text">Email</span>
            </label>
            <input
              id="email-input"
              type="email"
              placeholder="email@example.com"
              className="input input-bordered"
            />
          </div>
          <div className="form-control mt-4">
            <button type="button" className="btn btn-primary">
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
